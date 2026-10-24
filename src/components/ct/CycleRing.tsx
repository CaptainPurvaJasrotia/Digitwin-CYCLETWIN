import { phaseFor, type Phase } from "@/lib/cycle";

const COLORS: Record<Phase, string> = {
  Menstrual: "var(--phase-menstrual)",
  Follicular: "var(--phase-follicular)",
  Ovulation: "var(--phase-ovulation)",
  Luteal: "var(--phase-luteal)",
};

export function CycleRing({ day, cycleLen, periodLen, size = 280, phase }: { day: number; cycleLen: number; periodLen: number; size?: number; phase: Phase }) {
  const r = size / 2 - 22;
  const c = size / 2;
  const arcs = Array.from({ length: cycleLen }, (_, i) => {
    const a0 = (i / cycleLen) * Math.PI * 2 - Math.PI / 2 + 0.02;
    const a1 = ((i + 1) / cycleLen) * Math.PI * 2 - Math.PI / 2 - 0.02;
    const p = phaseFor(i + 1, cycleLen, periodLen);
    const d = `M ${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}`;
    return { d, p, i };
  });
  const shown = Math.min(day, cycleLen);
  const ang = ((shown - 0.5) / cycleLen) * Math.PI * 2 - Math.PI / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Cycle day ${day}, ${phase} phase`}>
        <circle cx={c} cy={c} r={r - 26} fill="var(--card)" className="animate-pulse-glow" />
        {arcs.map(({ d, p, i }) => (
          <path key={i} d={d} stroke={COLORS[p]} strokeWidth={i + 1 === shown ? 22 : 14} strokeLinecap="round" fill="none"
            opacity={i + 1 <= shown ? 1 : 0.35} style={{ transition: "all .6s", animation: `rise .5s ${i * 0.02}s both` }} />
        ))}
        <circle cx={c + r * Math.cos(ang)} cy={c + r * Math.sin(ang)} r={9} fill="var(--background)" stroke={COLORS[phase]} strokeWidth={4} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Day</span>
        <span className="font-display text-6xl font-semibold leading-none">{day}</span>
        <span className="mt-2 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground" style={{ background: COLORS[phase] }}>{phase}</span>
      </div>
    </div>
  );
}

export function PhaseLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {(Object.keys(COLORS) as Phase[]).map((p) => (
        <span key={p} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[p] }} />{p}</span>
      ))}
    </div>
  );
}
