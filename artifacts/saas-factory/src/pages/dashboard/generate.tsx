import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetProject, useGenerateProject, getGetProjectQueryKey, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Zap, Loader2, ChevronLeft, CheckCircle2, Code2 } from "lucide-react";

const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku"];

export default function GenerateProject({ params }: { params: Record<string, string> }) {
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: project } = useGetProject(id, { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } });
  const generateMutation = useGenerateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      }
    }
  });

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate({ id, data: { prompt: prompt.trim(), model } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${id}`} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold">AI Generation</h1>
          {project && <p className="text-sm text-muted-foreground">{project.name}</p>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">AI Model</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODELS.map(m => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${model === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Describe your SaaS</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Build a CRM platform with contact management, deal pipeline tracking, and email integration. Include a dashboard with revenue metrics, contact list with search/filter, deal kanban board, and activity timeline."
            rows={6}
            className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Be specific. Include features, data models, and user flows for better results.</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Costs ~5 credits per generation</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generateMutation.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Code</>
            )}
          </button>
        </div>
      </div>

      {generateMutation.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-green-400">Generation Complete</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{generateMutation.data.message} ({generateMutation.data.creditsUsed} credits used)</p>
          <Link href={`/dashboard/${id}`}>
            <a className="flex items-center gap-2 text-sm text-primary hover:opacity-80">
              <Code2 className="w-4 h-4" /> View generated code
            </a>
          </Link>
        </div>
      )}

      {generateMutation.isError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">
          Generation failed. Please try again.
        </div>
      )}

      {/* Tips */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Tips for better results</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {[
            "Describe the exact features you need — be specific about what each page does",
            "Mention data relationships (e.g. 'users have many projects, projects have many tasks')",
            "Include authentication requirements (login, roles, permissions)",
            "Specify if you need payments, file uploads, or real-time features",
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2">
              <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
