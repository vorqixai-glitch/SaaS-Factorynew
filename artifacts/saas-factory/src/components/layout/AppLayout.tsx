import { Link, useLocation } from "wouter";
import { LayoutDashboard, Plus, FileCode, CreditCard, Layers, Menu, X, Zap } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "New Project", icon: Plus },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-wide text-foreground">SaaS Factory</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground mb-1">Credits</div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">200 / 500 used</div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border flex items-center px-6 gap-4 sticky top-0 bg-background/95 backdrop-blur z-10">
          <button className="lg:hidden" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <Link href="/dashboard/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
