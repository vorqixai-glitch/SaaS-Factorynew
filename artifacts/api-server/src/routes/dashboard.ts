import { Router } from "express";
import { db, projectsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.userId, req.user.id));
  const totalProjects = projects.length;
  const deployedProjects = projects.filter(p => p.status === "deployed").length;
  const activeGenerations = projects.filter(p => p.status === "generating").length;
  const totalCreditsUsed = projects.reduce((sum, p) => sum + p.creditsUsed, 0);
  const creditsRemaining = Math.max(0, 500 - totalCreditsUsed);

  const projectsByStatus: Record<string, number> = {};
  for (const p of projects) {
    projectsByStatus[p.status] = (projectsByStatus[p.status] ?? 0) + 1;
  }

  res.json({ totalProjects, deployedProjects, creditsRemaining, creditsUsed: totalCreditsUsed, activeGenerations, projectsByStatus });
});

router.get("/dashboard/activity", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const items = await db.select().from(activityTable)
    .where(eq(activityTable.userId, req.user.id))
    .orderBy(desc(activityTable.createdAt))
    .limit(20);
  res.json(items.map(item => ({ ...item, createdAt: item.createdAt.toISOString() })));
});

export default router;
