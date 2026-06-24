import { useState } from "react";
import { Link } from "wouter";
import { useListTemplates } from "@workspace/api-client-react";
import { FileCode, Users, GraduationCap, ShoppingCart, BarChart3, Rocket, Store, Code2, Calendar, MessageSquare, Sparkles, FileText, ArrowRight, Search } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  FileCode, Users, GraduationCap, ShoppingCart, BarChart3, Rocket, Store, Code2, Calendar, MessageSquare, Sparkles, FileText,
};

const CATEGORIES = ["All", "General", "Business", "Commerce", "Education", "Analytics", "Developer", "Social", "Content", "AI"];

export default function Templates() {
  const { data: templates, isLoading } = useListTemplates();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = templates?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Production-ready starting points for any SaaS category.</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${category === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map(t => {
            const Icon = iconMap[t.icon] ?? FileCode;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.popular && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">Popular</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{t.category}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed mb-4">{t.description}</p>
                <Link href={`/dashboard/new?template=${t.id}`}>
                  <a className="flex items-center justify-center gap-2 border border-border text-sm font-medium py-2 rounded-md hover:border-primary hover:text-primary transition-colors group-hover:border-primary/60">
                    Use template <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {filtered?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No templates match your search.</p>
        </div>
      )}
    </div>
  );
}
