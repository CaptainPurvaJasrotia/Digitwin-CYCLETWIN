import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertTriangle, Check, Info, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CycleRing, PhaseLegend } from "@/components/ct/CycleRing";
import { Glass, NeedsProfile, PageHeader, Stat, meta } from "@/components/ct/ui";
import { useApp, useTwin } from "@/lib/store";
import { alerts, PHASE_META, today } from "@/lib/cycle";
import { Tour } from "@/components/ct/Tour";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: meta("Today", "Your cycle day, predictions, wellness score and twin health age.") }),
  component: () => <NeedsProfile><Dashboard /></NeedsProfile>,
});

const CHALLENGES = ["Drink 8 glasses of water", "10-minute walk after lunch", "Add one iron-rich food", "Lights out before 11 pm"];

function Dashboard() {
  const { state } = useApp();
  const { cc, score, twinAge, age, logList } = useTwin();
  const al = alerts(cc, logList, state.profile);
  const logged = !!state.logs[today()];
  if (!cc) return null;
  const meta = PHASE_META[cc.phase];
  return (
    <div>
      {state.demo && <Tour />}
      <PageHeader title={`Hi ${state.profile!.name} ${meta.emoji}`} sub={format(new Date(), "EEEE, d MMMM")}>
        <Button asChild className={logged ? "" : "bg-gradient-primary shadow-glow"} variant={logged ? "outline" : "default"}><Link to="/app/log">{logged ? <Check /> : <PenLine />}{logged ? "Logged today" : "Log today (60s)"}</Link></Button>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Glass className="flex flex-col items-center gap-4" >
          <div data-tour="ring"><CycleRing day={cc.day} cycleLen={cc.cycleLen} periodLen={cc.periodLen} phase={cc.phase} /></div>
          <PhaseLegend />
        </Glass>
        <div className="grid gap-5 sm:grid-cols-2">
          <Stat label="Next period" value={cc.daysToPeriod >= 0 ? `in ${cc.daysToPeriod}d` : "Due"} hint={format(cc.nextPeriod, "d MMM")} color="var(--phase-menstrual)" />
          <Stat label="Ovulation" value={cc.daysToOvulation >= 0 ? `in ${cc.daysToOvulation}d` : "Passed"} hint={format(cc.ovulation, "d MMM") + " · estimated"} color="var(--phase-ovulation)" />
          <div data-tour="score"><Stat label="Wellness score" value={score ? `${score}/100` : "—"} hint="Sleep, nutrition, activity, stress, regularity, hydration" color="var(--teal)" /></div>
          <Stat label="Twin health age" value={score ? twinAge : "—"} hint={score ? `vs your age ${age} · ${twinAge <= age ? "your twin is thriving" : "small habits can bring this down"}` : "Log a few days to calculate"} color="var(--phase-luteal)" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Glass className="lg:col-span-1" >
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{cc.phase} phase tip</div>
          <p className="mt-2">{meta.tip}</p>
        </Glass>
        <Glass className="lg:col-span-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Twin predicts</div>
          <div className="mt-2 space-y-2" data-tour="alerts">
            {al.length === 0 && <p className="text-sm text-muted-foreground">All calm. Keep logging so your twin learns your patterns.</p>}
            {al.map((a, i) => (
              <div key={i} className="flex gap-2 text-sm">{a.tone === "warn" ? <AlertTriangle className="h-4 w-4 shrink-0 text-primary" /> : <Info className="h-4 w-4 shrink-0 text-teal" />}{a.text}</div>
            ))}
          </div>
        </Glass>
        <Glass>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Today's gentle challenges</div>
          <ul className="mt-2 space-y-2">{CHALLENGES.map((c) => <li key={c} className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-teal" />{c}</li>)}</ul>
          <Button asChild variant="link" className="px-0"><Link to="/app/rewards">See rewards →</Link></Button>
        </Glass>
      </div>
    </div>
  );
}
