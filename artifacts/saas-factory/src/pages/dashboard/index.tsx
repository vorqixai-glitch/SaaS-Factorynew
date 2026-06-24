import { Link } from "wouter";
import { useListProjects, useGetDashboardStats, useGetRecentActivity, useDeleteProject, getListProjectsQueryKey, getGetDashboardStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Rocket, Zap, Globe, TrendingUp, Clock, Trash2, ExternalLink, ChevronRight, Activity } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-yellow-500/20 text-yellow-400",
  ready: "bg-primary/20 text-primary",
  deployed: "bg-green-500/20 text-green-400",
  error: "bg-destructive/20 text-destructive",
};

const activityIcons: Record<string, React.ElementType> = {
  created: Plus,
  generated: Zap,
  deployed: Rocket,
  error: Activity,
  updated: TrendingUp,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: stats } = useGetDashboardStats();
  const { data: activity } = useGetRecentActivity();
  const deleteMutation = useDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      }
    }
  });

  const statCards = [
    { label: "Total Projects", value: stats?.totalProjects ?? 0, icon: Globe, color: "text-primary" },
    { label: "Deployed", value: stats?.deployedProjects ?? 0, icon: Rocket, color: "text-green-400" },
    { label: "Credits Used", value: stats?.creditsUsed ?? 0, icon: Zap, color: "text-yellow-400" },
    { label: "Credits Left", value: stats?.creditsRemaining ?? 0, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your SaaS projects</p>
        </div>
        <Link href="/dashboard/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Projects</h2>
            <Link href="/dashboard/new" className="text-xs text-primary hover:opacity-80 flex items-center gap-0.5">New <ChevronRight className="w-3 h-3" /></Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !projects?.length ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first AI-generated SaaS in minutes.</p>
              <Link href="/dashboard/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
                <Plus className="w-4 h-4" /> Create project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/dashboard/${project.id}`} className="font-medium text-sm hover:text-primary transition-colors truncate">{project.name}</Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[project.status] ?? "bg-muted text-muted-foreground"}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{project.creditsUsed} credits</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(project.updatedAt)}</span>
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{project.template}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.deployedUrl && (
                      <a href={project.deployedUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-secondary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    )}
                    <Link href={`/dashboard/${project.id}`} className="p-1.5 rounded hover:bg-secondary transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => deleteMutation.mutate({ id: project.id })}
                      className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="font-semibold">Recent Activity</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {!activity?.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No activity yet</div>
            ) : (
              activity.slice(0, 8).map(item => {
                const Icon = activityIcons[item.type] ?? Activity;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
