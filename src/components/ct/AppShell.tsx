import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Activity, BookOpen, Brain, CalendarDays, Gift, HeartPulse, Home, LayoutDashboard, Leaf, Menu, MessageCircle, Moon, PenLine, Shield, ShieldAlert, Stethoscope, Sun, TrendingUp, Wallet, X, Droplet, Watch } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "./ui";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/app", label: "Today", icon: LayoutDashboard },
  { to: "/app/log", label: "Daily log", icon: PenLine },
  { to: "/app/twin", label: "My twin", icon: HeartPulse },
  { to: "/app/insights", label: "Insights", icon: TrendingUp },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/plans", label: "Wellness plans", icon: Leaf },
  { to: "/app/ask", label: "Ask Twin", icon: MessageCircle },
  { to: "/app/mind", label: "Mind", icon: Brain },
  { to: "/app/risk", label: "Risk screener", icon: ShieldAlert },
  { to: "/app/rewards", label: "Rewards", icon: Gift },
  { to: "/app/hygiene", label: "Hygiene", icon: Droplet },
  { to: "/app/doctor", label: "Doctor mode", icon: Stethoscope },
  { to: "/app/learn", label: "Learn", icon: BookOpen },
  { to: "/app/care", label: "Care & help", icon: Activity },
  { to: "/app/data", label: "Wearables & data", icon: Watch },
  { to: "/app/privacy", label: "Privacy", icon: Shield },
] as const;

const MOBILE = ["/app", "/app/log", "/app/twin", "/app/insights", "/app/ask"];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, set, loadDemo, exitDemo } = useApp();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const name = state.settings.incognito ? "Notes" : "CycleTwin";
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          activeProps={{ className: "bg-secondary text-foreground font-medium" }}>
          <n.icon className="h-4 w-4" />{n.label}
        </Link>
      ))}
      <div className="my-2 border-t" />
      <Link to="/pricing" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><Wallet className="h-4 w-4" />Plans</Link>
      <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><Home className="h-4 w-4" />About</Link>
    </nav>
  );
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <Link to="/app" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="h-6 w-6 rounded-full bg-gradient-primary" />{name}
          </Link>
          {state.demo && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">Demo</span>}
          <div className="ml-auto flex items-center gap-2">
            {state.demo ? <Button size="sm" variant="ghost" onClick={exitDemo}>Exit demo</Button> : <Button size="sm" variant="outline" onClick={loadDemo}>Demo mode</Button>}
            <Button size="icon" variant="ghost" aria-label="Toggle theme" onClick={() => set((s) => ({ ...s, settings: { ...s.settings, dark: !s.settings.dark } }))}>
              {state.settings.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-6 lg:block">{nav}</aside>
        {open && <div className="fixed inset-0 top-14 z-20 overflow-y-auto bg-background p-4 lg:hidden">{nav}</div>}
        <main key={loc.pathname} className="min-w-0 flex-1 py-6 pb-28 animate-rise">{children}<Disclaimer /></main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-background/85 py-2 backdrop-blur-xl lg:hidden">
        {NAV.filter((n) => MOBILE.includes(n.to)).map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className={cn("flex flex-col items-center gap-0.5 px-2 text-[11px] text-muted-foreground")} activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" />{n.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
