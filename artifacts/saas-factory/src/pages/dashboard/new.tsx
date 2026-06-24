import { useState } from "react";
import { useLocation } from "wouter";
import { useListTemplates, useCreateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, FileCode, Users, GraduationCap, ShoppingCart, BarChart3, Rocket, Store, Code2, Calendar, MessageSquare, FileText, Loader2, ArrowRight, Check } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  FileCode, Users, GraduationCap, ShoppingCart, BarChart3, Rocket, Store, Code2, Calendar, MessageSquare, Sparkles, FileText,
};

export default function NewProject() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: templates } = useListTemplates();
  const createMutation = useCreateProject({
    mutation: {
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        navigate(`/dashboard/${project.id}`);
      }
    }
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate({ data: { name: name.trim(), description: description.trim() || undefined, template: selectedTemplate } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a template and describe your SaaS product.</p>
      </div>

      {/* Name + description */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Project Details</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Project Name <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My SaaS Product"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description <span className="text-muted-foreground">(optional)</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Briefly describe what your SaaS does..."
            rows={3}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>

      {/* Template picker */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Choose a Template</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {templates?.map(t => {
            const Icon = iconMap[t.icon] ?? FileCode;
            const selected = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-primary/20" : "bg-secondary"}`}>
                  <Icon className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${selected ? "text-foreground" : ""}`}>{t.name}</span>
                    {t.popular && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">Popular</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
                {selected && <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={!name.trim() || createMutation.isPending}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createMutation.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creating project...</>
        ) : (
          <>Create Project <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}
