import { createFileRoute } from "@tanstack/react-router";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Glass, NeedsProfile, PageHeader, Premium, Stat, meta } from "@/components/ct/ui";
import { useApp, useTwin } from "@/lib/store";
import { NUTRIENTS, phaseFor, SYMPTOMS, type DayLog, type Phase } from "@/lib/cycle";

export const Route = createFileRoute("/app/insights")({
  head: () => ({ meta: meta("Insights & monthly report", "Cycle trends, correlations, nutrition, symptom heatmap and your 6-axis wellness radar.") }),
  component: () => <NeedsProfile><Insights /></NeedsProfile>,
});
const tt = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 } };
const PC: Record<Phase, string> = { Menstrual: "var(--phase-menstrual)", Follicular: "var(--phase-follicular)", Ovulation: "var(--phase-ovulation)", Luteal: "var(--phase-luteal)" };

function Insights() {
  const { state } = useApp();
  const { stats, parts, logList } = useTwin();
  const periods = [...state.periods].sort();
  const dayOf = (l: DayLog) => { const p = periods.filter((x) => x <= l.date).pop(); return p ? differenceInCalendarDays(parseISO(l.date), parseISO(p)) + 1 : 0; };
  const trend = stats.lengths.map((len, i) => ({ cycle: `C${i + 1}`, length: len }));
  const radar = [
    { k: "Hormonal", v: parts.regularity }, { k: "Nutrition", v: parts.nutrition }, { k: "Sleep", v: parts.sleep },
    { k: "Fitness", v: parts.activity }, { k: "Mental", v: parts.mental }, { k: "Hydration", v: parts.hydration },
  ].map((x) => ({ ...x, v: Math.round(x.v) }));
  const month = logList.slice(-30);
  const nut = NUTRIENTS.map((n) => ({ n, days: month.filter((l) => l.nutrients?.includes(n)).length, target: 25 }));
  const phaseCount: Record<Phase, number> = { Menstrual: 0, Follicular: 0, Ovulation: 0, Luteal: 0 };
  month.forEach((l) => { const d = dayOf(l); if (d) phaseCount[phaseFor(Math.min(d, stats.avg), stats.avg, state.profile!.periodLength)]++; });
  const donut = (Object.keys(phaseCount) as Phase[]).map((p) => ({ name: p, value: phaseCount[p] }));
  // correlations
  const cr = logList.filter((l) => (l.pain ?? 0) >= 4);
  const lowSleepPain = cr.filter((l) => (l.sleepHours ?? 7) < 6.5).length;
  const corr: string[] = [];
  if (cr.length) corr.push(`Cramps were stronger on low-sleep days in ${Math.round((lowSleepPain / cr.length) * 100)}% of painful days.`);
  const hi = logList.filter((l) => (l.stress ?? 0) >= 6); if (hi.length) corr.push(`Mood averaged ${(hi.reduce((a, l) => a + (l.mood ?? 3), 0) / hi.length).toFixed(1)}/5 on high-stress days vs ${(logList.reduce((a, l) => a + (l.mood ?? 3), 0) / (logList.length || 1)).toFixed(1)} overall.`);
  const wd = logList.filter((l) => (l.water ?? 0) >= 7); if (wd.length) corr.push(`Headaches appeared ${Math.round((wd.filter((l) => l.symptoms?.includes("Headache")).length / wd.length) * 100)}% of the time on well-hydrated days.`);
  // heatmap
  const heat = SYMPTOMS.map((s) => ({ s, cells: Array.from({ length: stats.avg }, (_, i) => logList.filter((l) => dayOf(l) === i + 1 && l.symptoms?.includes(s)).length) }));
  const maxH = Math.max(1, ...heat.flatMap((h) => h.cells));
  const flags: string[] = [];
  if (stats.sd > 7) flags.push("Cycle length varies a lot — worth discussing with a gynecologist.");
  if (logList.filter((l) => l.flow === 3 && l.clots).length > 4) flags.push("Frequent heavy flow with clots — please consult a doctor.");
  if (logList.slice(-30).filter((l) => (l.pain ?? 0) >= 8).length > 3) flags.push("Severe pain on several days — please consult a doctor.");

  if (logList.length < 3) return <Glass className="text-center"><h2 className="text-xl font-semibold">A few more logs, please</h2><p className="text-muted-foreground">Insights appear after 3 days of logging.</p></Glass>;

  return (
    <div>
      <PageHeader title="Insights" sub="Your monthly report — patterns your twin has noticed.">
        <Button variant="outline" onClick={() => (state.premium ? window.print() : alert("PDF export is part of Premium."))}><Download />Export PDF</Button>
      </PageHeader>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Regularity" value={`${stats.regularity}%`} hint={`±${stats.sd.toFixed(1)} days`} color="var(--teal)" />
        <Stat label="Average cycle" value={`${stats.avg}d`} hint={`last ${Math.min(6, stats.lengths.length)} cycles`} />
        <Stat label="Days logged" value={logList.length} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Glass><h3 className="font-semibold">Cycle length trend</h3><div className="h-56"><ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="cycle" fontSize={12} stroke="var(--muted-foreground)" /><YAxis domain={[20, 40]} fontSize={12} stroke="var(--muted-foreground)" /><Tooltip {...tt} /><Line dataKey="length" stroke="var(--chart-1)" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Glass>
        <Glass><h3 className="font-semibold">Wellness radar</h3><div className="h-56"><ResponsiveContainer><RadarChart data={radar}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="k" fontSize={12} tick={{ fill: "var(--muted-foreground)" }} /><Radar dataKey="v" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.35} /></RadarChart></ResponsiveContainer></div></Glass>
        <Glass><h3 className="font-semibold">Nutrition vs target (last 30 days)</h3><div className="h-56"><ResponsiveContainer><BarChart data={nut}><XAxis dataKey="n" fontSize={12} stroke="var(--muted-foreground)" /><YAxis fontSize={12} stroke="var(--muted-foreground)" /><Tooltip {...tt} /><Bar dataKey="target" fill="var(--muted)" radius={6} /><Bar dataKey="days" fill="var(--teal)" radius={6} /></BarChart></ResponsiveContainer></div></Glass>
        <Glass><h3 className="font-semibold">Phase breakdown (30 days)</h3><div className="h-56"><ResponsiveContainer><PieChart><Pie data={donut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{donut.map((d) => <Cell key={d.name} fill={PC[d.name as Phase]} />)}</Pie><Tooltip {...tt} /></PieChart></ResponsiveContainer></div></Glass>
      </div>
      <Premium feature="Full reports">
        <Glass className="mt-5">
          <h3 className="font-semibold">Symptom heatmap by cycle day</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="text-xs"><tbody>
              {heat.map((h) => (
                <tr key={h.s}><td className="pr-3 text-muted-foreground">{h.s}</td>{h.cells.map((c, i) => <td key={i}><div className="m-0.5 h-4 w-4 rounded" title={`Day ${i + 1}: ${c}`} style={{ background: `color-mix(in oklab, var(--phase-menstrual) ${(c / maxH) * 100}%, var(--muted))` }} /></td>)}</tr>
              ))}
            </tbody></table>
          </div>
        </Glass>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Glass><h3 className="font-semibold">Correlations</h3><ul className="mt-2 space-y-2 text-sm">{corr.map((c) => <li key={c}>• {c}</li>)}</ul></Glass>
          <Glass><h3 className="font-semibold">Gentle flags</h3>{flags.length ? <ul className="mt-2 space-y-2 text-sm">{flags.map((c) => <li key={c}>⚠️ {c}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Nothing unusual. If something feels off, trust yourself and consult a doctor.</p>}</Glass>
        </div>
      </Premium>
    </div>
  );
}
