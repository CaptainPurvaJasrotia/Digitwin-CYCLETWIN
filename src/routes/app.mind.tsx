import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Chip, Glass, NeedsProfile, PageHeader, meta } from "@/components/ct/ui";
import { useApp, useTwin } from "@/lib/store";
import { hormones, today } from "@/lib/cycle";

export const Route = createFileRoute("/app/mind")({
  head: () => ({ meta: meta("Mental wellness", "Mood vs hormone trends, guided breathing, meditation timer, gratitude journal and PMDD awareness.") }),
  component: () => <NeedsProfile><Mind /></NeedsProfile>,
});

const PMDD = ["Feeling very sad or hopeless before periods", "Strong irritability or anger", "Anxiety or feeling on edge", "Mood swings that affect relationships", "Trouble concentrating", "Symptoms ease once period starts"];

function Mind() {
  const { state, set } = useApp();
  const { logList, stats } = useTwin();
  const periods = [...state.periods].sort();
  const data = logList.slice(-30).map((l) => { const p = periods.filter((x) => x <= l.date).pop(); const d = p ? differenceInCalendarDays(parseISO(l.date), parseISO(p)) + 1 : 1; const h = hormones(d, stats.avg); return { date: l.date.slice(5), Mood: (l.mood ?? 3) * 20, Estrogen: h.Estrogen, Progesterone: h.Progesterone }; });
  const [breath, setBreath] = useState(false);
  const [secs, setSecs] = useState(0);
  useEffect(() => { if (secs <= 0) return; const t = setTimeout(() => setSecs(secs - 1), 1000); return () => clearTimeout(t); }, [secs]);
  const [txt, setTxt] = useState("");
  const [checks, setChecks] = useState<number[]>([]);
  return (
    <div>
      <PageHeader title="Mind" sub="Your feelings are valid, and they're connected to your cycle." />
      <Glass><h3 className="font-semibold">Mood vs estimated hormones (30 days)</h3><div className="h-60"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" /><YAxis hide /><Tooltip contentStyle={{ background: "var(--popover)", borderRadius: 12 }} /><Legend /><Line dataKey="Mood" stroke="var(--teal)" strokeWidth={3} dot={false} /><Line dataKey="Estrogen" stroke="var(--chart-1)" dot={false} strokeDasharray="4 3" /><Line dataKey="Progesterone" stroke="var(--chart-4)" dot={false} strokeDasharray="4 3" /></LineChart></ResponsiveContainer></div></Glass>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Glass className="flex flex-col items-center text-center">
          <h3 className="font-semibold">Guided breathing</h3>
          <div className="my-6 grid h-40 w-40 place-items-center">
            <div className={`h-40 w-40 rounded-full bg-gradient-primary opacity-70 ${breath ? "animate-breathe" : ""}`} />
          </div>
          <p className="text-sm text-muted-foreground">{breath ? "Breathe in as it grows… out as it shrinks." : "4 seconds in, 4 seconds out."}</p>
          <Button className="mt-3" variant="outline" onClick={() => setBreath(!breath)}>{breath ? "Stop" : "Start breathing"}</Button>
        </Glass>
        <Glass className="flex flex-col items-center text-center">
          <h3 className="font-semibold">2-minute meditation</h3>
          <div className="my-8 font-display text-6xl">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</div>
          <p className="text-sm text-muted-foreground">{secs ? "Notice your breath. Let thoughts pass like clouds." : "Find a comfortable seat."}</p>
          <Button className="mt-3" onClick={() => setSecs(secs ? 0 : 120)}>{secs ? "End" : "Begin"}</Button>
        </Glass>
        <Glass>
          <h3 className="font-semibold">Gratitude journal</h3>
          <Textarea className="mt-3" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="One small thing I'm grateful for today…" />
          <Button className="mt-2" disabled={!txt.trim()} onClick={() => { set((s) => ({ ...s, journal: [{ date: today(), text: txt }, ...s.journal] })); setTxt(""); }}>Save</Button>
          <ul className="mt-4 space-y-2 text-sm">{state.journal.slice(0, 5).map((j, i) => <li key={i} className="rounded-xl bg-secondary/50 p-2"><span className="text-xs text-muted-foreground">{j.date}</span><br />{j.text}</li>)}</ul>
        </Glass>
        <Glass>
          <h3 className="font-semibold">PMS / PMDD awareness check</h3>
          <p className="text-sm text-muted-foreground">In the week before your period, do you often experience:</p>
          <div className="mt-3 flex flex-wrap gap-2">{PMDD.map((p, i) => <Chip key={p} active={checks.includes(i)} onClick={() => setChecks(checks.includes(i) ? checks.filter((x) => x !== i) : [...checks, i])}>{p}</Chip>)}</div>
          <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            {checks.length >= 5 ? "Many of these match PMDD patterns. You deserve support — please talk to a doctor or call Tele-MANAS 14416." : checks.length >= 2 ? "These sound like common PMS. Tracking helps; reach out if they feel heavy." : "Tap what feels familiar. This is awareness, not a diagnosis."}
          </p>
        </Glass>
      </div>
    </div>
  );
}
