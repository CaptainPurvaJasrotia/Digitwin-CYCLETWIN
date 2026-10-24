import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Glass, NeedsProfile, PageHeader, Premium, meta } from "@/components/ct/ui";
import { useTwin } from "@/lib/store";
import { hormones, simulate, type SimInput } from "@/lib/cycle";

export const Route = createFileRoute("/app/twin")({
  head: () => ({ meta: meta("My digital twin", "Explore your twin's body zones, estimated hormones and a what-if simulator.") }),
  component: () => <NeedsProfile><Twin /></NeedsProfile>,
});

const health = (v: number) => (v >= 70 ? "var(--phase-follicular)" : v >= 45 ? "var(--phase-ovulation)" : "var(--phase-menstrual)");

function Twin() {
  const { cc, parts, logList } = useTwin();
  const last = logList.slice(-7);
  const avgPain = last.reduce((a, l) => a + (l.pain ?? 0), 0) / (last.length || 1);
  const zones = {
    hormones: { label: "Hormones", v: parts.regularity, x: 100, y: 52, d: "Based on cycle regularity and phase timing." },
    mood: { label: "Mood", v: parts.mental, x: 100, y: 28, d: "Mood and anxiety over the last week." },
    energy: { label: "Energy", v: (parts.sleep + parts.activity) / 2, x: 100, y: 105, d: "Sleep and movement drive your energy." },
    gut: { label: "Gut", v: parts.nutrition, x: 100, y: 150, d: "Fiber, sugar and nutrient intake." },
    uterus: { label: "Uterus", v: Math.max(0, 100 - avgPain * 12), x: 100, y: 185, d: "Recent pain and flow." },
    bones: { label: "Bones", v: Math.min(100, parts.nutrition * 0.6 + parts.activity * 0.4), x: 140, y: 260, d: "Calcium and weight-bearing exercise." },
  };
  const [sel, setSel] = useState<keyof typeof zones>("uterus");
  const z = zones[sel];
  const curve = useMemo(() => Array.from({ length: cc!.cycleLen }, (_, i) => hormones(i + 1, cc!.cycleLen)), [cc]);

  return (
    <div>
      <PageHeader title="Your digital twin" sub="Tap a glowing zone to see how it's doing. Colors update from your logs." />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Glass className="flex flex-col items-center">
          <svg viewBox="0 0 200 320" className="h-80 w-auto">
            <defs><linearGradient id="body" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--blush)" /><stop offset="1" stopColor="var(--lavender)" /></linearGradient></defs>
            <circle cx="100" cy="30" r="22" fill="url(#body)" />
            <path d="M70 60 Q100 52 130 60 L140 130 Q150 170 140 200 L128 300 L110 300 L102 210 L98 210 L90 300 L72 300 L60 200 Q50 170 60 130 Z" fill="url(#body)" opacity=".9" />
            <path d="M70 66 L42 150 L50 154 L78 90 Z M130 66 L158 150 L150 154 L122 90 Z" fill="url(#body)" opacity=".8" />
            {Object.entries(zones).map(([k, zz]) => (
              <g key={k} onClick={() => setSel(k as keyof typeof zones)} className="cursor-pointer">
                <circle cx={zz.x} cy={zz.y} r={sel === k ? 15 : 11} fill={health(zz.v)} opacity=".35" className="animate-pulse-glow" />
                <circle cx={zz.x} cy={zz.y} r={6} fill={health(zz.v)} stroke="var(--background)" strokeWidth="2" />
              </g>
            ))}
          </svg>
          <div className="mt-2 w-full rounded-xl bg-secondary/60 p-3 text-center">
            <div className="font-display text-xl font-semibold">{z.label} · {Math.round(z.v)}</div>
            <div className="text-xs text-muted-foreground">{z.d}</div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">{Object.entries(zones).map(([k, zz]) => <button key={k} onClick={() => setSel(k as keyof typeof zones)} className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: health(zz.v) }}>{zz.label}</button>)}</div>
        </Glass>
        <Glass>
          <h3 className="text-lg font-semibold">Estimated hormone rhythm</h3>
          <p className="text-xs text-muted-foreground">Educational model of a typical cycle scaled to your {cc!.cycleLen}-day average. Not a lab value.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <ReferenceLine x={Math.min(cc!.day, cc!.cycleLen)} stroke="var(--foreground)" strokeDasharray="4 4" label={{ value: "Today", fill: "var(--foreground)", fontSize: 12 }} />
                <Line type="monotone" dataKey="Estrogen" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Progesterone" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="LH" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="FSH" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>
      <div className="mt-5"><Premium feature="What-if Simulator"><Simulator /></Premium></div>
    </div>
  );
}

function Simulator() {
  const { cc, logList } = useTwin();
  const last = logList.slice(-7);
  const avg = (f: (l: (typeof last)[0]) => number, d: number) => (last.length ? last.reduce((a, l) => a + f(l), 0) / last.length : d);
  const base: SimInput = { sleep: Math.round(avg((l) => l.sleepHours ?? 7, 7)), exercise: Math.round(avg((l) => l.exerciseMin ?? 0, 15)), water: Math.round(avg((l) => l.water ?? 5, 5)), stress: Math.round(avg((l) => l.stress ?? 5, 5)), iron: false };
  const [s, setS] = useState<SimInput>(base);
  const b = simulate(base, cc!.phase);
  const r = simulate(s, cc!.phase);
  const data = (["energy", "pain", "mood", "score"] as const).map((k) => ({ name: k[0].toUpperCase() + k.slice(1), Baseline: b[k], "What-if": r[k] }));
  const sl = (k: keyof Omit<SimInput, "iron">, label: string, max: number, unit: string) => (
    <div><div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium">{s[k]}{unit}</span></div><Slider className="mt-2" min={0} max={max} value={[s[k]]} onValueChange={([v]) => setS({ ...s, [k]: v })} /></div>
  );
  return (
    <Glass>
      <h3 className="text-lg font-semibold">What-if simulator</h3>
      <p className="text-sm text-muted-foreground">Move the sliders to see what your twin predicts for tomorrow vs your current habits.</p>
      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          {sl("sleep", "Sleep", 10, "h")}{sl("exercise", "Exercise", 90, " min")}{sl("water", "Water", 12, " glasses")}{sl("stress", "Stress", 10, "/10")}
          <label className="flex items-center justify-between text-sm">Iron-rich food today <Switch checked={s.iron} onCheckedChange={(v) => setS({ ...s, iron: v })} /></label>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} /><Legend />
              <Bar dataKey="Baseline" fill="var(--lavender)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="What-if" fill="var(--teal)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Glass>
  );
}
