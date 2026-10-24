import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Brain, CalendarHeart, HeartPulse, LineChart, ShieldCheck, Sparkles, Stethoscope, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CycleRing, PhaseLegend } from "@/components/ct/CycleRing";
import { Glass, meta, Disclaimer } from "@/components/ct/ui";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import type { Phase } from "@/lib/cycle";
import { phaseFor } from "@/lib/cycle";

export const Route = createFileRoute("/")({
  head: () => ({ meta: meta("Your body's digital twin", "CycleTwin is a living digital twin of your menstrual and overall wellness — it learns from daily logs and predicts what comes next.") }),
  component: Landing,
});

const FEATURES = [
  { icon: HeartPulse, t: "Living digital twin", d: "A body model that glows with your energy, mood, gut and hormone health — updated daily." },
  { icon: LineChart, t: "Adaptive predictions", d: "Learns from your last 3–6 cycles, not a fixed 28 days. PMS, ovulation and late-period alerts." },
  { icon: Sparkles, t: "What-if simulator", d: "See how one more hour of sleep or a glass of water changes tomorrow's cramps and energy." },
  { icon: Utensils, t: "Desi phase-synced plans", d: "Ragi, dal, spinach, jaggery and curd — meals and workouts synced to your phase." },
  { icon: Brain, t: "Mind & mood", d: "Mood vs hormone trends, guided breathing, gratitude journal and PMDD awareness." },
  { icon: Stethoscope, t: "Doctor-ready", d: "One-page summaries and consent-based share links when you want a professional's view." },
];

const ROADMAP = [
  ["Q1", "Twin core, logs, predictions, Hindi"],
  ["Q2", "Ask Twin AI, wearables, Doctor marketplace"],
  ["Q3", "School & college portal, CSR sponsorships"],
  ["Q4", "Regional languages, offline-first, research insights (opt-in)"],
];

function Landing() {
  const { loadDemo } = useApp();
  const nav = useNavigate();
  const [day, setDay] = useState(1);
  useEffect(() => { const t = setInterval(() => setDay((d) => (d % 28) + 1), 450); return () => clearInterval(t); }, []);
  const phase: Phase = phaseFor(day, 28, 5);
  const demo = () => { loadDemo(); nav({ to: "/app" }); };

  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-xl font-semibold"><span className="h-7 w-7 rounded-full bg-gradient-primary" />CycleTwin</span>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
        </nav>
        <Button asChild size="sm" variant="outline"><Link to="/app">Open app</Link></Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-rise">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">Private · Desi · Built for girls & women</span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] md:text-7xl">Meet the <span className="text-gradient italic">twin</span> who knows your cycle.</h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">CycleTwin builds a living model of your body from 60-second daily check-ins — then predicts your period, energy, cramps and mood before they happen.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="bg-gradient-primary shadow-glow" onClick={demo}>Try demo <ArrowRight /></Button>
            <Button size="lg" variant="outline" asChild><Link to="/onboarding">Create my twin</Link></Button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-float"><CycleRing day={day} cycleLen={28} periodLen={5} phase={phase} size={320} /></div>
          <PhaseLegend />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Glass>
            <h2 className="text-2xl font-semibold">The problem</h2>
            <p className="mt-2 text-muted-foreground">71% of girls in India don't know about menstruation before their first period. 1 in 5 women live with PCOS — most undiagnosed. Period apps treat every body like a 28-day calendar.</p>
          </Glass>
          <Glass>
            <h2 className="text-2xl font-semibold">Our answer</h2>
            <p className="mt-2 text-muted-foreground">A personal digital twin that connects sleep, food, stress and movement to your hormones — explained warmly, in your language, without shame and without selling your data.</p>
          </Glass>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-4xl font-semibold">Everything your cycle has been trying to tell you</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Glass key={f.t}>
              <f.icon className="text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </Glass>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
        {[["355M", "menstruating people in India"], ["₹4,200 Cr", "femtech opportunity by 2030"], ["₹149", "per month Premium · free core forever"]].map(([a, b]) => (
          <Glass key={a} className="text-center"><div className="font-display text-4xl font-semibold text-gradient">{a}</div><div className="mt-1 text-sm text-muted-foreground">{b}</div></Glass>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Glass>
            <h2 className="text-2xl font-semibold">Business model</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Freemium subscriptions — ₹149/mo or ₹999/yr</li>
              <li>• Institution licences for schools & colleges</li>
              <li>• 20% commission on doctor consults</li>
              <li>• Clearly labelled affiliate shop & sponsorships</li>
              <li>• CSR grants: sponsor a girl's Premium</li>
            </ul>
            <Button asChild variant="link" className="px-0"></Button>
          </Glass>
          <Glass>
            <h2 className="text-2xl font-semibold">Roadmap</h2>
            <ol className="mt-3 space-y-3">
              {ROADMAP.map(([q, t]) => <li key={q} className="flex gap-3 text-sm"><span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">{q}</span><span className="text-muted-foreground">{t}</span></li>)}
            </ol>
          </Glass>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Glass className="flex flex-col items-center gap-4 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-teal" />
          <h2 className="text-3xl font-semibold">We never sell your individual data. Ever.</h2>
          <p className="max-w-xl text-muted-foreground">No ads inside health logs or doctor summaries. DPDP Act-aligned. One tap to export or delete everything.</p>
          <div className="flex gap-3"><Button onClick={demo} className="bg-gradient-primary">Try the demo</Button><Button variant="outline" asChild><Link to="/app/calendar"><CalendarHeart />Calendar</Link></Button></div>
        </Glass>
        <Disclaimer />
      </section>
    </div>
  );
}
