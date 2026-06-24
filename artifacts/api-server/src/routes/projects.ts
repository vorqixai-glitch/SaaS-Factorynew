import { Router } from "express";
import { db, projectsTable, projectFilesTable, deploymentsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  GenerateProjectParams,
  GenerateProjectBody,
  DeployProjectParams,
  DeployProjectBody,
  ListDeploymentsParams,
  ListProjectFilesParams,
} from "@workspace/api-zod";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

function serializeProject(p: typeof projectsTable.$inferSelect) {
  return {
    ...p,
    creditsUsed: p.creditsUsed,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function serializeDeployment(d: typeof deploymentsTable.$inferSelect) {
  return {
    ...d,
    createdAt: d.createdAt.toISOString(),
  };
}

function serializeFile(f: typeof projectFilesTable.$inferSelect) {
  return {
    ...f,
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/projects", async (req, res) => {
  const projects = await db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt));
  res.json(projects.map(serializeProject));
});

router.post("/projects", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, description, template } = parsed.data;
  const [project] = await db
    .insert(projectsTable)
    .values({ name, description: description ?? null, slug: slugify(name), template: template ?? "blank", status: "draft" })
    .returning();
  await db.insert(activityTable).values({ type: "created", message: `Project "${name}" created`, projectName: name, projectId: project.id });
  res.status(201).json(serializeProject(project));
});

router.get("/projects/:id", async (req, res) => {
  const parsed = GetProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, parsed.data.id));
  if (!project) { res.status(404).json({ error: "Not found" }); return; }
  res.json(serializeProject(project));
});

router.patch("/projects/:id", async (req, res) => {
  const paramParsed = UpdateProjectParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const bodyParsed = UpdateProjectBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }
  const [updated] = await db
    .update(projectsTable)
    .set({ ...bodyParsed.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(serializeProject(updated));
});

router.delete("/projects/:id", async (req, res) => {
  const parsed = DeleteProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(deploymentsTable).where(eq(deploymentsTable.projectId, parsed.data.id));
  await db.delete(projectFilesTable).where(eq(projectFilesTable.projectId, parsed.data.id));
  await db.delete(activityTable).where(eq(activityTable.projectId, parsed.data.id));
  await db.delete(projectsTable).where(eq(projectsTable.id, parsed.data.id));
  res.status(204).send();
});

router.post("/projects/:id/generate", async (req, res) => {
  const paramParsed = GenerateProjectParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const bodyParsed = GenerateProjectBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, paramParsed.data.id));
  if (!project) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(projectsTable)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id));

  const prompt = bodyParsed.data.prompt;
  const model = bodyParsed.data.model ?? "gpt-4o-mini";

  const systemPrompt = `You are an expert full-stack developer. Generate production-ready SaaS code based on the user's description.
Output a complete React + TypeScript application with:
- A well-structured App.tsx as the main entry point
- Multiple page components for all features described
- Tailwind CSS for styling (dark theme preferred)
- Realistic mock data so the UI looks populated
- Clean, readable code with proper TypeScript types

Format your response as multiple code files using this exact format for each file:
=== filename.tsx ===
<file content here>

Start with App.tsx, then create all necessary component files. Make it look professional and complete.`;

  let generatedCode = "";
  let creditsToUse = 5;

  try {
    const openaiModel = model.startsWith("claude") ? "gpt-4o" : model;
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Build this SaaS product:\n\nName: ${project.name}\nTemplate: ${project.template}\nDescription: ${project.description ?? ""}\n\nUser requirements: ${prompt}` },
      ],
    });

    generatedCode = completion.choices[0]?.message?.content ?? "";
    creditsToUse = Math.ceil((completion.usage?.total_tokens ?? 1000) / 200);
  } catch (err) {
    req.log.error({ err }, "OpenAI generation failed");
    await db.update(projectsTable)
      .set({ status: "error", updatedAt: new Date() })
      .where(eq(projectsTable.id, paramParsed.data.id));
    res.status(500).json({ error: "AI generation failed. Please try again." });
    return;
  }

  await db.update(projectsTable)
    .set({ status: "ready", generatedCode, creditsUsed: project.creditsUsed + creditsToUse, updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id));

  const fileMatches = [...generatedCode.matchAll(/=== (.+?) ===\n([\s\S]*?)(?=\n=== |$)/g)];
  if (fileMatches.length > 0) {
    await db.delete(projectFilesTable).where(eq(projectFilesTable.projectId, paramParsed.data.id));
    for (const match of fileMatches) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      const ext = filePath.split(".").pop() ?? "tsx";
      const language = ext === "ts" || ext === "tsx" ? "typescript" : ext === "css" ? "css" : "javascript";
      await db.insert(projectFilesTable).values({
        projectId: paramParsed.data.id,
        filePath,
        content,
        language,
      });
    }
  }

  await db.insert(activityTable).values({
    type: "generated",
    message: `AI generation complete for "${project.name}"`,
    projectName: project.name,
    projectId: project.id,
  });

  res.json({ success: true, message: "Generation complete", creditsUsed: creditsToUse, generatedCode });
});

router.post("/projects/:id/deploy", async (req, res) => {
  const paramParsed = DeployProjectParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const bodyParsed = DeployProjectBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, paramParsed.data.id));
  if (!project) { res.status(404).json({ error: "Not found" }); return; }

  const platform = bodyParsed.data.platform;
  const mockUrl = `https://${project.slug}.${platform === "vercel" ? "vercel.app" : platform === "netlify" ? "netlify.app" : "repl.co"}`;

  const [deployment] = await db.insert(deploymentsTable)
    .values({ projectId: paramParsed.data.id, platform, status: "live", deployedUrl: mockUrl })
    .returning();

  await db.update(projectsTable)
    .set({ status: "deployed", deployedUrl: mockUrl, updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id));

  await db.insert(activityTable).values({
    type: "deployed",
    message: `"${project.name}" deployed to ${platform}`,
    projectName: project.name,
    projectId: project.id,
  });

  res.status(201).json(serializeDeployment(deployment));
});

router.get("/projects/:id/deployments", async (req, res) => {
  const parsed = ListDeploymentsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const deployments = await db.select().from(deploymentsTable)
    .where(eq(deploymentsTable.projectId, parsed.data.id))
    .orderBy(desc(deploymentsTable.createdAt));
  res.json(deployments.map(serializeDeployment));
});

router.get("/projects/:id/files", async (req, res) => {
  const parsed = ListProjectFilesParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const files = await db.select().from(projectFilesTable)
    .where(eq(projectFilesTable.projectId, parsed.data.id));
  res.json(files.map(serializeFile));
});

export default router;
