import { Link } from "wouter";
import { Zap, User, LogOut } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout } = useAuth();

  const displayName = user?.firstName ?? user?.email?.split("@")[0] ?? "Account";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm tracking-wide">SaaS Factory</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">Hi, {displayName}</span>
                <Link href="/dashboard" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={login} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Sign in
                </button>
                <button onClick={login} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                  Get started free
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">SaaS Factory</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SaaS Factory. Build fast. Ship faster.</p>
        </div>
      </footer>
    </div>
  );
}
