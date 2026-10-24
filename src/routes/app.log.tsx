import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip, Glass, NeedsProfile, PageHeader, meta } from "@/components/ct/ui";
import { useApp } from "@/lib/store";
import { NUTRIENTS, SYMPTOMS, today, type DayLog } from "@/lib/cycle";

export const Route = createFileRoute("/app/log")({
  head: () => ({ meta: meta("Daily log", "A tap-based daily check-in that takes under 60 seconds.") }),
  component: () => <NeedsProfile><Log /></NeedsProfile>,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="text-sm font-medium">{label}</div><div className="flex flex-wrap gap-2">{children}</div></div>;
}

function Log() {
  const { state, set } = useApp();
  const nav = useNavigate();
  const d = today();
  const [l, setL] = useState<DayLog>(state.logs[d] ?? { date: d, nutrients: [], symptoms: [] });
  const up = <K extends keyof DayLog>(k: K, v: DayLog[K]) => setL((x) => ({ ...x, [k]: v }));
  const tog = (k: "nutrients" | "symptoms", v: string) => up(k, (l[k] ?? []).includes(v) ? l[k]!.filter((x) => x !== v) : [...(l[k] ?? []), v]);
  const scale = (k: keyof DayLog, vals: (number | string)[], labels?: string[]) =>
    vals.map((v, i) => <Chip key={String(v)} active={l[k] === v} onClick={() => up(k, v as never)}>{labels?.[i] ?? v}</Chip>);

  const save = () => {
    set((s) => {
      const periods = [...s.periods];
      const yesterday = s.logs[Object.keys(s.logs).sort().pop() ?? ""];
      if (l.flow && l.flow > 0 && !(yesterday?.flow) && !periods.includes(d)) {
        const last = periods.sort().pop();
        if (!last || (Date.parse(d) - Date.parse(last)) / 864e5 > 15) periods.push(d);
      }
      return { ...s, periods, logs: { ...s.logs, [d]: l } };
    });
    toast.success("Logged! Your twin just updated 💗");
    nav({ to: "/app" });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="How are you today?" sub="Tap what fits. Skip anything — every bit helps your twin learn." />
      <div className="grid gap-5">
        <Glass className="space-y-5">
          <h3 className="text-lg font-semibold">Period</h3>
          <Row label="Flow">{scale("flow", [0, 1, 2, 3], ["None", "Light", "Medium", "Heavy"])}</Row>
          <Row label="Clots"><Chip active={!!l.clots} onClick={() => up("clots", !l.clots)}>Noticed clots</Chip></Row>
          <Row label="Product used">{scale("product", ["pad", "tampon", "cup", "underwear"])}</Row>
          <Row label="Changes today">{scale("pads", [0, 1, 2, 3, 4, 5, 6])}</Row>
          <Row label="Pain (0–10)">{scale("pain", [0, 2, 4, 6, 8, 10])}</Row>
        </Glass>
        <Glass className="space-y-5">
          <h3 className="text-lg font-semibold">Mind & energy</h3>
          <Row label="Mood">{scale("mood", [1, 2, 3, 4, 5], ["😞", "😕", "😐", "🙂", "😄"])}</Row>
          <Row label="Energy">{scale("energy", [1, 2, 3, 4, 5], ["🪫", "Low", "Okay", "Good", "⚡"])}</Row>
          <Row label="Stress">{scale("stress", [0, 2, 4, 6, 8, 10])}</Row>
          <Row label="Anxiety">{scale("anxiety", [0, 2, 4, 6, 8, 10])}</Row>
        </Glass>
        <Glass className="space-y-5">
          <h3 className="text-lg font-semibold">Food & water</h3>
          <Row label="Water (glasses)">{scale("water", [2, 4, 6, 8, 10])}</Row>
          <Row label="Ate enough…">{NUTRIENTS.map((n) => <Chip key={n} active={l.nutrients?.includes(n)} onClick={() => tog("nutrients", n)}>{n}</Chip>)}</Row>
          <Row label="Sugar">{scale("sugar", [0, 1, 2, 3], ["None", "A little", "Some", "Lots"])}</Row>
          <Row label="Caffeine (cups)">{scale("caffeine", [0, 1, 2, 3])}</Row>
        </Glass>
        <Glass className="space-y-5">
          <h3 className="text-lg font-semibold">Sleep & movement</h3>
          <Row label="Sleep hours">{scale("sleepHours", [5, 6, 7, 8, 9])}</Row>
          <Row label="Sleep quality">{scale("sleepQuality", [1, 2, 3, 4, 5], ["Poor", "Meh", "Okay", "Good", "Great"])}</Row>
          <Row label="Exercise">{scale("exerciseType", ["Yoga", "Walk", "Dance", "Strength", "Sport"])}</Row>
          <Row label="Minutes">{scale("exerciseMin", [0, 10, 20, 30, 45, 60])}</Row>
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" placeholder="Steps" value={l.steps ?? ""} onChange={(e) => up("steps", +e.target.value)} />
            <Input type="number" placeholder="Weight kg" value={l.weight ?? ""} onChange={(e) => up("weight", +e.target.value)} />
            <Input type="number" step="0.1" placeholder="Temp °C" value={l.temperature ?? ""} onChange={(e) => up("temperature", +e.target.value)} />
          </div>
        </Glass>
        <Glass className="space-y-5">
          <h3 className="text-lg font-semibold">Symptoms</h3>
          <Row label="Tap all that apply">{SYMPTOMS.map((n) => <Chip key={n} active={l.symptoms?.includes(n)} onClick={() => tog("symptoms", n)}>{n}</Chip>)}</Row>
          <Input placeholder="Medicines or supplements (optional)" value={l.notes ?? ""} onChange={(e) => up("notes", e.target.value)} />
        </Glass>
        <Button size="lg" className="sticky bottom-20 bg-gradient-primary shadow-glow lg:bottom-4" onClick={save}>Save today's log</Button>
      </div>
    </div>
  );
}
