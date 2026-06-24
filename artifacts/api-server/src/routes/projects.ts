import { Router } from "express";
import { db, projectsTable, projectFilesTable, deploymentsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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

  const creditsToUse = 5;
  const prompt = bodyParsed.data.prompt;

  const mockCode = `// Generated SaaS: ${project.name}
// Prompt: ${prompt}
import React from 'react';
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">${project.name}</h1>
        <p className="mt-4 text-gray-400">${prompt}</p>
      </div>
    </div>
  );
}`;

  await db.update(projectsTable)
    .set({ status: "ready", generatedCode: mockCode, creditsUsed: project.creditsUsed + creditsToUse, updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id));

  await db.insert(activityTable).values({
    type: "generated",
    message: `AI generation complete for "${project.name}"`,
    projectName: project.name,
    projectId: project.id,
  });

  res.json({ success: true, message: "Generation complete", creditsUsed: creditsToUse, generatedCode: mockCode });
});

router.post("/projects/:id/deploy", async (req, res) => {
  const paramParsed = DeployProjectParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const bodyParsed = DeployProjectBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, paramParsed.data.id));
  if (!project) { res.status(404).json({ error: "Not found" }); return; }

  const platform = bodyParsed.data.platform;
  const mockUrl = `https://${project.slug}.${platform}.app`;

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
