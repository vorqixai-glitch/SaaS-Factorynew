import { Link } from "wouter";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { CreditCard, Zap, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: 10,
    projects: 1,
    features: ["1 project", "10 AI credits/month", "Community templates", "Manual deploy"],
    current: false,
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/ month",
    credits: 100,
    projects: 3,
    features: ["3 projects", "100 AI credits/month", "All templates", "One-click deploy", "Priority support"],
    current: true,
    cta: "Upgrade to Starter",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/ month",
    credits: 500,
    projects: 10,
    features: ["10 projects", "500 AI credits/month", "Team collaboration", "Advanced AI models", "API access", "Analytics"],
    current: false,
    cta: "Upgrade to Pro",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/ month",
    credits: 2000,
    projects: -1,
    features: ["Unlimited projects", "2000 AI credits/month", "White-label", "Dedicated infra", "SLA guarantee", "24/7 support"],
    current: false,
    cta: "Contact sales",
    highlight: false,
  },
];

export default function Billing() {
  const { data: stats } = useGetDashboardStats();
  const creditsUsed = stats?.creditsUsed ?? 0;
  const creditsTotal = 500;
  const creditsPercent = Math.min(100, (creditsUsed / creditsTotal) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and credit usage.</p>
      </div>

      {/* Current usage */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Current Plan</h2>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Pro</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">Pro</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium">$79 / month</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Renewal</span><span className="font-medium">Jul 24, 2026</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Projects</span><span className="font-medium">{stats?.totalProjects ?? 0} / 10</span></div>
          </div>
          <button className="mt-5 w-full flex items-center justify-center gap-2 border border-border text-sm py-2 rounded-md hover:border-destructive/50 hover:text-destructive transition-colors">
            Cancel plan
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Credit Usage</h2>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">{creditsUsed}<span className="text-lg text-muted-foreground"> / {creditsTotal}</span></div>
          <p className="text-xs text-muted-foreground mb-4">credits used this month</p>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${creditsPercent}%`,
                background: creditsPercent > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{creditsUsed} used</span>
            <span>{creditsTotal - creditsUsed} remaining</span>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Credit top-ups</h3>
            <div className="grid grid-cols-3 gap-2">
              {[{ credits: 50, price: "$5" }, { credits: 200, price: "$18" }, { credits: 500, price: "$40" }].map(({ credits, price }) => (
                <button key={credits} className="p-2 border border-border rounded-md hover:border-primary/50 hover:bg-primary/5 transition-colors text-center">
                  <div className="text-sm font-bold">{credits}</div>
                  <div className="text-xs text-muted-foreground">{price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="font-semibold mb-6">Upgrade your plan</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(plan => (
            <div key={plan.name} className={`rounded-xl p-5 border flex flex-col relative ${plan.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Most popular
                </div>
              )}
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">{plan.name}</div>
                <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground"> {plan.period}</span></div>
              </div>
              <ul className="space-y-2 flex-1 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-md text-xs font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 ${plan.current ? "bg-secondary text-secondary-foreground cursor-default" : plan.highlight ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary/50"}`} disabled={plan.current}>
                {plan.current ? "Current plan" : <>{plan.cta} <ArrowRight className="w-3 h-3" /></>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method placeholder */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Payment Method</h2>
          <CreditCard className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-4 p-3 border border-border rounded-lg">
          <div className="w-10 h-7 bg-secondary rounded flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Visa ending in 4242</div>
            <div className="text-xs text-muted-foreground">Expires 12/2027</div>
          </div>
          <button className="text-xs text-primary hover:opacity-80">Update</button>
        </div>
      </div>
    </div>
  );
}
