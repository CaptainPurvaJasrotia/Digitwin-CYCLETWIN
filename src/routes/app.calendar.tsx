import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths, differenceInCalendarDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Glass, NeedsProfile, PageHeader, meta } from "@/components/ct/ui";
import { useApp, useTwin } from "@/lib/store";
import { iso } from "@/lib/cycle";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: meta("Calendar", "Your periods, predicted periods, fertile window and symptoms at a glance.") }),
  component: () => <NeedsProfile><Cal /></NeedsProfile>,
});

function Cal() {
  const { state } = useApp();
  const { stats, cc } = useTwin();
  const [m, setM] = useState(new Date());
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(m)), end: endOfWeek(endOfMonth(m)) });
  const pl = state.profile!.periodLength;
  const predicted: string[] = [];
  const fertile: string[] = [];
  const ov: string[] = [];
  if (cc) {
    for (let k = 0; k < 4; k++) {
      const s = addDays(cc.nextPeriod, k * stats.avg);
      for (let i = 0; i < pl; i++) predicted.push(iso(addDays(s, i)));
      const o = addDays(s, -14);
      ov.push(iso(o));
      for (let i = -5; i <= 1; i++) fertile.push(iso(addDays(o, i)));
    }
  }
  const kind = (ds: string) => {
    const lg = state.logs[ds];
    if (lg?.flow) return "period";
    if (state.periods.some((p) => { const d = differenceInCalendarDays(parseISO(ds), parseISO(p)); return d >= 0 && d < pl; }) && ds <= iso(new Date())) return "period";
    if (ds > iso(new Date()) && predicted.includes(ds)) return "predicted";
    if (ov.includes(ds)) return "ov";
    if (fertile.includes(ds)) return "fertile";
    return "";
  };
  const style: Record<string, React.CSSProperties> = {
    period: { background: "var(--phase-menstrual)", color: "var(--primary-foreground)" },
    predicted: { border: "2px dashed var(--phase-menstrual)" },
    ov: { background: "var(--phase-ovulation)" },
    fertile: { background: "color-mix(in oklab, var(--phase-follicular) 30%, transparent)" },
  };
  return (
    <div>
      <PageHeader title="Calendar" sub="Predictions adapt as your twin learns.">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setM(subMonths(m, 1))} aria-label="Previous month"><ChevronLeft /></Button>
          <span className="w-36 text-center font-display text-lg">{format(m, "MMMM yyyy")}</span>
          <Button size="icon" variant="outline" onClick={() => setM(addMonths(m, 1))} aria-label="Next month"><ChevronRight /></Button>
        </div>
      </PageHeader>
      <Glass>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}</div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const ds = iso(d); const k = kind(ds); const sym = state.logs[ds]?.symptoms?.length ?? 0;
            return (
              <div key={ds} className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${isSameMonth(d, m) ? "" : "opacity-30"} ${ds === iso(new Date()) ? "ring-2 ring-foreground" : ""}`} style={style[k]}>
                {format(d, "d")}
                {sym > 0 && <div className="absolute bottom-1 flex gap-0.5">{Array.from({ length: Math.min(sym, 3) }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-luteal" />)}</div>}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={style.period} />Period</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={style.predicted} />Predicted</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={style.fertile} />Fertile window</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={style.ov} />Ovulation</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-luteal" />Symptoms</span>
        </div>
      </Glass>
    </div>
  );
}
