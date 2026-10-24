import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Chip, Glass, meta } from "@/components/ct/ui";
import { useApp } from "@/lib/store";
import { iso, type Profile } from "@/lib/cycle";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: meta("Create your twin", "Set up your CycleTwin in two minutes — cycle, lifestyle and goals.") }),
  component: Onboarding,
});

const CONDITIONS = ["PCOS", "Thyroid", "Anemia", "Endometriosis"];
const GOALS = ["Less cramps", "More energy", "Better sleep", "Clear skin", "Regular cycles", "Understand my body", "Fitness"];

function Onboarding() {
  const { set } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [lastDays, setLastDays] = useState(10);
  const [p, setP] = useState<Profile>({ name: "", age: 18, height: 158, weight: 52, cycleLength: 28, irregular: false, periodLength: 5, activity: "moderate", diet: "veg", sleep: 7, conditions: [], goals: [] });
  const up = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const toggle = (k: "conditions" | "goals", v: string) => up(k, p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v]);

  const finish = () => {
    set((s) => ({ ...s, profile: { ...p, name: p.name || "Friend" }, periods: [iso(subDays(new Date(), lastDays))], logs: {}, demo: false }));
    nav({ to: "/app" });
  };

  const steps = [
    <div key="a" className="space-y-4">
      <div><Label>What should your twin call you?</Label><Input value={p.name} onChange={(e) => up("name", e.target.value)} placeholder="Name or nickname" /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Age</Label><Input type="number" value={p.age} onChange={(e) => up("age", +e.target.value)} /></div>
        <div><Label>Height (cm)</Label><Input type="number" value={p.height} onChange={(e) => up("height", +e.target.value)} /></div>
        <div><Label>Weight (kg)</Label><Input type="number" value={p.weight} onChange={(e) => up("weight", +e.target.value)} /></div>
      </div>
    </div>,
    <div key="b" className="space-y-5">
      <div><Label>Cycle length: {p.irregular ? "irregular" : `${p.cycleLength} days`}</Label><Slider className="mt-3" min={21} max={35} value={[p.cycleLength]} onValueChange={([v]) => up("cycleLength", v)} disabled={p.irregular} /></div>
      <Chip active={p.irregular} onClick={() => up("irregular", !p.irregular)}>My cycles are irregular</Chip>
      <div><Label>Period length: {p.periodLength} days</Label><Slider className="mt-3" min={2} max={9} value={[p.periodLength]} onValueChange={([v]) => up("periodLength", v)} /></div>
      <div><Label>Last period started {lastDays} days ago</Label><Slider className="mt-3" min={0} max={45} value={[lastDays]} onValueChange={([v]) => setLastDays(v)} /></div>
    </div>,
    <div key="c" className="space-y-5">
      <div><Label>Activity</Label><div className="mt-2 flex gap-2">{(["low", "moderate", "high"] as const).map((a) => <Chip key={a} active={p.activity === a} onClick={() => up("activity", a)}>{a}</Chip>)}</div></div>
      <div><Label>Diet</Label><div className="mt-2 flex flex-wrap gap-2">{(["veg", "eggetarian", "non-veg", "vegan"] as const).map((a) => <Chip key={a} active={p.diet === a} onClick={() => up("diet", a)}>{a}</Chip>)}</div></div>
      <div><Label>Usual sleep: {p.sleep}h</Label><Slider className="mt-3" min={4} max={10} step={0.5} value={[p.sleep]} onValueChange={([v]) => up("sleep", v)} /></div>
    </div>,
    <div key="d" className="space-y-5">
      <div><Label>Any known conditions? (optional, private)</Label><div className="mt-2 flex flex-wrap gap-2">{CONDITIONS.map((c) => <Chip key={c} active={p.conditions.includes(c)} onClick={() => toggle("conditions", c)}>{c}</Chip>)}</div></div>
      <div><Label>Your goals</Label><div className="mt-2 flex flex-wrap gap-2">{GOALS.map((c) => <Chip key={c} active={p.goals.includes(c)} onClick={() => toggle("goals", c)}>{c}</Chip>)}</div></div>
    </div>,
  ];
  const titles = ["Hello there 💗", "Your cycle", "Your lifestyle", "Your health & goals"];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
      <div className="mb-4 flex gap-1.5">{steps.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
      <Glass key={step}>
        <h1 className="mb-5 text-3xl font-semibold">{titles[step]}</h1>
        {steps[step]}
        <div className="mt-8 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < steps.length - 1 ? <Button onClick={() => setStep(step + 1)}>Continue</Button> : <Button className="bg-gradient-primary" onClick={finish}>Meet my twin</Button>}
        </div>
      </Glass>
      <p className="mt-4 text-center text-xs text-muted-foreground">Stored privately on your device. You can delete it anytime.</p>
    </div>
  );
}
