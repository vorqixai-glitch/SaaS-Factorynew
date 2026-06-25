import { Link, useLocation } from "wouter";
import { LayoutDashboard, Plus, CreditCard, Layers, Menu, X, Zap, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "New Project", icon: Plus },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: stats } = useGetDashboardStats();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  const creditsUsed = stats?.creditsUsed ?? 0;
  const creditsTotal = 500;
  const creditsPercent = Math.min(100, (creditsUsed / creditsTotal) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Zap className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to SaaS Factory</h1>
            <p className="text-muted-foreground text-sm">Sign in to build and deploy your SaaS products with AI.</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-left space-y-2">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Zap className="w-3.5 h-3.5" /> Free account includes
            </div>
            <ul className="text-muted-foreground space-y-1 ml-5 list-disc text-xs">
              <li>50 free AI credits on sign-up</li>
              <li>1 project</li>
              <li>All community templates</li>
              <li>Manual deploy</li>
            </ul>
          </div>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4" />
            Sign in / Sign up
          </button>
          <p className="text-xs text-muted-foreground">No credit card required</p>
        </div>
      </div>
    );
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.email ?? "Account";
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

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

        {/* Credits bar */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Credits</span>
            <Link href="/billing" className="text-xs text-primary hover:opacity-80">Top up</Link>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${creditsPercent}%`,
                background: creditsPercent > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">{creditsUsed} / {creditsTotal} used</div>
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-sidebar-border flex items-center gap-2.5">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{displayName}</div>
            {user?.email && <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
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
