import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const meta = (title: string, description: string) => [
  { title: `${title} · CycleTwin` },
  { name: "description", content: description },
  { property: "og:title", content: `${title} · CycleTwin` },
  { property: "og:description", content: description },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

export function Glass({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glass p-5 animate-rise", className)}>{children}</div>;
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-rise">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function NeedsProfile({ children }: { children: ReactNode }) {
  const { state, ready, loadDemo } = useApp();
  if (!ready) return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="glass h-40 animate-pulse" />)}</div>;
  if (state.profile) return <>{children}</>;
  return (
    <Glass className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Sparkles /></div>
      <h2 className="text-2xl font-semibold">Your twin is waiting to meet you</h2>
      <p className="mt-2 text-muted-foreground">Set up your profile in two minutes, or explore with a realistic 6-month demo.</p>
      <div className="mt-5 flex justify-center gap-3">
        <Button asChild><Link to="/onboarding">Create my twin</Link></Button>
        <Button variant="outline" onClick={loadDemo}>Try demo</Button>
      </div>
    </Glass>
  );
}

export function Premium({ feature, children }: { feature: string; children: ReactNode }) {
  const { state, set } = useApp();
  if (state.premium) return <>{children}</>;
  return (
    <Glass className="mx-auto max-w-md text-center">
      <Lock className="mx-auto mb-2 text-primary" />
      <h3 className="text-xl font-semibold">{feature} is a Premium feature</h3>
      <p className="mt-1 text-sm text-muted-foreground">Unlock it with a 7-day free trial — or keep using everything free. Your tracking always stays free.</p>
      <Button className="mt-4" onClick={() => set((s) => ({ ...s, premium: true }))}>Start 7-day free trial</Button>
    </Glass>
  );
}

export function Stat({ label, value, hint, color }: { label: string; value: ReactNode; hint?: string; color?: string }) {
  return (
    <Glass>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold" style={color ? { color } : undefined}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Glass>
  );
}

export function Disclaimer() {
  return <p className="mt-10 text-center text-xs text-muted-foreground">CycleTwin is an educational wellness tool, not a medical diagnosis. Always consult a doctor about health concerns.</p>;
}

export function Chip({ active, onClick, children }: { active?: boolean | undefined; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("rounded-full border px-3 py-1.5 text-sm transition-all active:scale-95", active ? "border-transparent bg-primary text-primary-foreground shadow-glow" : "bg-card hover:bg-secondary")}>
      {children}
    </button>
  );
}
