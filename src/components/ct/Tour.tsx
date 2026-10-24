import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STEPS = [
  { t: "Welcome to Ananya's twin", d: "This is a 6-month demo profile. Everything is unlocked so you can explore freely." },
  { t: "The Cycle Ring", d: "Shows today's cycle day and phase. Predictions use her last 6 cycles, not a fixed 28." },
  { t: "Wellness score & twin age", d: "A weighted mix of sleep, food, activity, stress, regularity and hydration." },
  { t: "Try the What-if simulator", d: "Open My Twin to see how sleep, water or exercise changes tomorrow.", link: "/app/twin" as const },
];

export function Tour() {
  const [i, setI] = useState(() => (typeof window !== "undefined" && sessionStorage.getItem("ct-tour") ? -1 : 0));
  if (i < 0) return null;
  const close = () => { sessionStorage.setItem("ct-tour", "1"); setI(-1); };
  const s = STEPS[i];
  return (
    <div className="glass fixed bottom-20 right-4 z-40 w-80 p-4 lg:bottom-6">
      <button onClick={close} className="absolute right-3 top-3 text-muted-foreground" aria-label="Close tour"><X className="h-4 w-4" /></button>
      <div className="text-xs text-muted-foreground">Guided tour · {i + 1}/{STEPS.length}</div>
      <h4 className="mt-1 font-display text-lg font-semibold">{s.t}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
      <div className="mt-3 flex justify-end gap-2">
        {i > 0 && <Button size="sm" variant="ghost" onClick={() => setI(i - 1)}>Back</Button>}
        {s.link ? <Button size="sm" asChild onClick={close}><Link to={s.link}>Open twin</Link></Button> : <Button size="sm" onClick={() => setI(i + 1)}>Next</Button>}
      </div>
    </div>
  );
}
