import { useState } from "react";
import { Link } from "wouter";
import {
  useGetProject, useListDeployments, useDeployProject,
  getGetProjectQueryKey, getListDeploymentsQueryKey, getListProjectsQueryKey, getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Rocket, ChevronLeft, Loader2, ExternalLink, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";

const PLATFORMS = [
  { id: "vercel", name: "Vercel", description: "Instant deploys, edge network, automatic HTTPS", color: "bg-black" },
  { id: "netlify", name: "Netlify", description: "Continuous deployment, form handling, serverless functions", color: "bg-teal-600" },
  { id: "replit", name: "Replit", description: "Deploy directly to Replit's cloud infrastructure", color: "bg-orange-500" },
] as const;

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  live: { label: "Live", color: "text-green-400", icon: CheckCircle2 },
  failed: { label: "Failed", color: "text-destructive", icon: AlertCircle },
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
  building: { label: "Building", color: "text-primary", icon: Loader2 },
};

export default function DeployProject({ params }: { params: Record<string, string> }) {
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const { data: project } = useGetProject(id, { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } });
  const { data: deployments } = useListDeployments(id, { query: { enabled: !!id, queryKey: getListDeploymentsQueryKey(id) } });
  const deployMutation = useDeployProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListDeploymentsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });

  const [selectedPlatform, setSelectedPlatform] = useState<"vercel" | "netlify" | "replit">("vercel");

  const handleDeploy = () => {
    deployMutation.mutate({ id, data: { platform: selectedPlatform } });
  };

  const canDeploy = project?.status === "ready" || project?.status === "deployed" || project?.status === "error";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Deploy</h1>
          {project && <p className="text-sm text-muted-foreground">{project.name}</p>}
        </div>
      </div>

      {/* Warning if not ready */}
      {project && !canDeploy && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Generate code first</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This project is in <span className="font-medium">{project.status}</span> status. Generate code before deploying.
            </p>
            <Link href={`/dashboard/${id}/generate`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:opacity-80 mt-2">
              <Zap className="w-3 h-3" /> Go to Generate
            </Link>
          </div>
        </div>
      )}

      {/* Platform selector */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-sm">Choose deployment platform</h2>
        <div className="space-y-2.5">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selectedPlatform === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm text-white ${p.color}`}>
                {p.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </div>
              {selectedPlatform === p.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>

        <button
          onClick={handleDeploy}
          disabled={deployMutation.isPending || !canDeploy}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deployMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
          ) : (
            <><Rocket className="w-4 h-4" /> Deploy to {PLATFORMS.find(p => p.id === selectedPlatform)?.name}</>
          )}
        </button>

        {deployMutation.isSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Deployment successful!</p>
              {deployMutation.data.deployedUrl && (
                <a
                  href={deployMutation.data.deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> {deployMutation.data.deployedUrl}
                </a>
              )}
            </div>
          </div>
        )}

        {deployMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" /> Deployment failed. Please try again.
          </div>
        )}
      </div>

      {/* Deployment history */}
      <div className="space-y-4">
        <h2 className="font-semibold">Deployment History</h2>
        {!deployments?.length ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Rocket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No deployments yet. Deploy your first version above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map(d => {
              const config = statusConfig[d.status] ?? statusConfig.pending;
              const Icon = config.icon;
              return (
                <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <Icon className={`w-5 h-5 shrink-0 ${config.color} ${d.status === "building" ? "animate-spin" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium capitalize">{d.platform}</span>
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</div>
                    {d.deployedUrl && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{d.deployedUrl}</div>
                    )}
                  </div>
                  {d.deployedUrl && (
                    <a
                      href={d.deployedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
