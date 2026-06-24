import { useState } from "react";
import { Link } from "wouter";
import { useGetProject, useListProjectFiles, useListDeployments, getGetProjectQueryKey } from "@workspace/api-client-react";
import { Code2, Eye, Rocket, Settings, Zap, Globe, Clock, ChevronLeft, ExternalLink } from "lucide-react";

type Tab = "overview" | "code" | "preview" | "deploy" | "settings";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-yellow-500/20 text-yellow-400",
  ready: "bg-primary/20 text-primary",
  deployed: "bg-green-500/20 text-green-400",
  error: "bg-destructive/20 text-destructive",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ProjectDetail({ params }: { params: Record<string, string> }) {
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: project, isLoading } = useGetProject(id, { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } });
  const { data: files } = useListProjectFiles(id, { query: { enabled: !!id, queryKey: ["list-project-files", id] as const } });
  const { data: deployments } = useListDeployments(id, { query: { enabled: !!id, queryKey: ["list-deployments", id] as const } });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "code", label: "Code", icon: Code2 },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "deploy", label: "Deploy", icon: Rocket },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-card border border-border rounded animate-pulse mb-6" />
        <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <Link href="/dashboard" className="text-sm text-primary hover:opacity-80">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold truncate">{project.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[project.status]}`}>{project.status}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{project.creditsUsed} credits</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {timeAgo(project.updatedAt)}</span>
            <span className="bg-secondary px-1.5 py-0.5 rounded">{project.template}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.deployedUrl && (
            <a href={project.deployedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Live URL
            </a>
          )}
          <Link href={`/dashboard/${project.id}/generate`} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity">
            <Zap className="w-3.5 h-3.5" /> Generate
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-0.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{project.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="font-medium">{project.template}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>{project.status}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Credits used</span><span className="font-medium">{project.creditsUsed}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link href={`/dashboard/${project.id}/generate`} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <Zap className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">AI Generate</div>
                  <div className="text-xs text-muted-foreground">Generate code with AI prompt</div>
                </div>
              </Link>
              <Link href={`/dashboard/${project.id}/deploy`} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Rocket className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Deploy</div>
                  <div className="text-xs text-muted-foreground">{deployments?.length ? `${deployments.length} deployments` : "Not deployed yet"}</div>
                </div>
              </Link>
            </div>
          </div>
          {project.description && (
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">Description</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "code" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
            <span className="text-xs text-muted-foreground font-mono">Generated Code</span>
            <span className="text-xs text-muted-foreground">{files?.length ?? 0} files</span>
          </div>
          {project.generatedCode ? (
            <pre className="p-5 text-xs font-mono text-foreground overflow-auto max-h-[500px] leading-relaxed whitespace-pre-wrap">
              {project.generatedCode}
            </pre>
          ) : (
            <div className="p-12 text-center">
              <Code2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No code generated yet.</p>
              <Link href={`/dashboard/${project.id}/generate`} className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80">
                <Zap className="w-3.5 h-3.5" /> Generate with AI
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "preview" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-muted-foreground font-mono flex-1 text-center">{project.previewUrl ?? project.deployedUrl ?? "No preview available"}</span>
          </div>
          {project.deployedUrl ? (
            <iframe src={project.deployedUrl} className="w-full h-[500px] bg-white" title="Preview" />
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Deploy your project to see a live preview.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "deploy" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Deployments</h3>
            <Link href={`/dashboard/${project.id}/deploy`} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-90">
              <Rocket className="w-3.5 h-3.5" /> Deploy Now
            </Link>
          </div>
          {!deployments?.length ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Rocket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No deployments yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map(d => (
                <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{d.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "live" ? "bg-green-500/20 text-green-400" : d.status === "failed" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</div>
                  </div>
                  {d.deployedUrl && (
                    <a href={d.deployedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80">
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Project Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input defaultValue={project.name} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea defaultValue={project.description ?? ""} rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h4>
            <p className="text-xs text-muted-foreground mb-3">Deleting a project is permanent and cannot be undone.</p>
            <Link href="/dashboard">
              <a className="text-xs border border-destructive/50 text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors">Delete Project</a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
