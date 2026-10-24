import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";

export type Phase = "Menstrual" | "Follicular" | "Ovulation" | "Luteal";

export interface Profile {
  name: string;
  age: number;
  height: number;
  weight: number;
  cycleLength: number;
  irregular: boolean;
  periodLength: number;
  activity: "low" | "moderate" | "high";
  diet: "veg" | "non-veg" | "vegan" | "eggetarian";
  sleep: number;
  conditions: string[];
  goals: string[];
}

export interface DayLog {
  date: string;
  flow?: 0 | 1 | 2 | 3; // none, light, medium, heavy
  clots?: boolean;
  pain?: number; // 0-10
  mood?: number; // 1-5
  energy?: number; // 1-5
  stress?: number; // 0-10
  anxiety?: number; // 0-10
  water?: number; // glasses
  nutrients?: string[]; // iron, protein, calcium, fiber
  sugar?: number; // 0-3
  caffeine?: number; // cups
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  exerciseType?: string;
  exerciseMin?: number;
  steps?: number;
  symptoms?: string[];
  weight?: number;
  temperature?: number;
  pads?: number;
  product?: "pad" | "tampon" | "cup" | "underwear";
  notes?: string;
}

export const SYMPTOMS = ["Headache", "Bloating", "Acne", "Cramps", "Nausea", "Back pain", "Cravings", "Discharge"];
export const NUTRIENTS = ["Iron", "Protein", "Calcium", "Fiber"];

export const PHASE_META: Record<Phase, { color: string; tip: string; emoji: string }> = {
  Menstrual: { color: "var(--phase-menstrual)", emoji: "🌙", tip: "Rest is productive. Warm ragi porridge, jaggery and dates help replenish iron. Gentle stretching eases cramps." },
  Follicular: { color: "var(--phase-follicular)", emoji: "🌱", tip: "Estrogen is rising — great time to start new projects, try strength training and plan your week." },
  Ovulation: { color: "var(--phase-ovulation)", emoji: "☀️", tip: "Peak energy and confidence. Schedule presentations, high-intensity workouts, and stay hydrated." },
  Luteal: { color: "var(--phase-luteal)", emoji: "🍂", tip: "Progesterone rises. Choose complex carbs, magnesium-rich foods like spinach and dark chocolate, and slow down evenings." },
};

export const iso = (d: Date) => format(d, "yyyy-MM-dd");
export const today = () => iso(new Date());

export function cycleStats(periods: string[], profile: Profile | null) {
  const sorted = [...periods].sort();
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) lengths.push(differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1])));
  const recent = lengths.slice(-6);
  const avg = recent.length >= 1 ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : profile?.cycleLength ?? 28;
  const sd = recent.length > 1 ? Math.sqrt(recent.reduce((a, b) => a + (b - avg) ** 2, 0) / recent.length) : 0;
  const regularity = Math.max(0, Math.round(100 - sd * 12));
  return { lengths, avg, sd, regularity };
}

export function phaseFor(day: number, cycleLen: number, periodLen: number): Phase {
  const ov = cycleLen - 14;
  if (day <= periodLen) return "Menstrual";
  if (day < ov - 1) return "Follicular";
  if (day <= ov + 1) return "Ovulation";
  return "Luteal";
}

export function currentCycle(periods: string[], profile: Profile | null, on = new Date()) {
  const { avg } = cycleStats(periods, profile);
  const periodLen = profile?.periodLength ?? 5;
  const sorted = [...periods].sort();
  const last = sorted.filter((p) => parseISO(p) <= on).pop();
  if (!last) return null;
  const day = differenceInCalendarDays(on, parseISO(last)) + 1;
  const nextPeriod = addDays(parseISO(last), avg);
  let ovulation = subDays(nextPeriod, 14);
  if (ovulation < on && day > avg - 14) ovulation = addDays(ovulation, avg);
  const late = day > avg + 3;
  return {
    day,
    cycleLen: avg,
    periodLen,
    phase: phaseFor(Math.min(day, avg), avg, periodLen),
    lastStart: last,
    nextPeriod,
    ovulation,
    daysToPeriod: differenceInCalendarDays(nextPeriod, on),
    daysToOvulation: differenceInCalendarDays(ovulation, on),
    late,
  };
}

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));

export function scoreParts(logs: DayLog[], regularity: number) {
  const n = logs.length || 1;
  const m = (f: (l: DayLog) => number) => logs.reduce((a, l) => a + f(l), 0) / n;
  const sleep = clamp(1 - Math.abs(m((l) => l.sleepHours ?? 7) - 8) / 4) * 100;
  const nutrition = clamp(m((l) => (l.nutrients?.length ?? 0) / 4) * 0.8 + (1 - m((l) => l.sugar ?? 1) / 3) * 0.2) * 100;
  const activity = clamp(m((l) => (l.exerciseMin ?? 0) / 30) * 0.6 + m((l) => (l.steps ?? 4000) / 8000) * 0.4) * 100;
  const stress = clamp(1 - m((l) => l.stress ?? 5) / 10) * 100;
  const hydration = clamp(m((l) => (l.water ?? 5) / 8)) * 100;
  const mental = clamp((m((l) => l.mood ?? 3) - 1) / 4 * 0.6 + (1 - m((l) => l.anxiety ?? 4) / 10) * 0.4) * 100;
  return { sleep, nutrition, activity, stress, hydration, regularity, mental };
}

export function wellnessScore(p: ReturnType<typeof scoreParts>) {
  return Math.round(p.sleep * 0.2 + p.nutrition * 0.2 + p.activity * 0.15 + p.stress * 0.15 + p.regularity * 0.15 + p.hydration * 0.15);
}

export function twinAge(age: number, score: number) {
  return Math.round((age + (70 - score) / 6) * 10) / 10;
}

/** Normalised estimated hormone levels (0-100) for a cycle day. Educational approximation. */
export function hormones(day: number, len: number) {
  const ov = len - 14;
  const g = (x: number, mu: number, s: number) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
  return {
    day,
    Estrogen: Math.round(20 + 70 * g(day, ov - 1, 3) + 30 * g(day, ov + 7, 3.5)),
    Progesterone: Math.round(5 + 85 * g(day, ov + 7, 3.5)),
    LH: Math.round(8 + 90 * g(day, ov, 1)),
    FSH: Math.round(15 + 25 * g(day, 3, 3) + 45 * g(day, ov, 1.2)),
  };
}

// ---------- simulator ----------
export interface SimInput { sleep: number; exercise: number; water: number; stress: number; iron: boolean }
export function simulate(s: SimInput, phase: Phase) {
  const phasePain = phase === "Menstrual" ? 6 : phase === "Luteal" ? 3 : 1;
  const energy = clamp((s.sleep / 8) * 0.4 + (s.exercise / 45) * 0.2 + (s.water / 8) * 0.15 + (1 - s.stress / 10) * 0.15 + (s.iron ? 0.1 : 0), 0, 1) * 100;
  const pain = clamp((phasePain - s.exercise / 20 - (s.water - 4) * 0.25 + s.stress * 0.3 - (s.iron ? 0.5 : 0)) / 10, 0, 1) * 100;
  const mood = clamp((s.sleep / 8) * 0.35 + (1 - s.stress / 10) * 0.4 + (s.exercise / 45) * 0.25, 0, 1) * 100;
  const score = Math.round(clamp((s.sleep / 8) * 0.25 + (s.exercise / 30) * 0.2 + (s.water / 8) * 0.2 + (1 - s.stress / 10) * 0.2 + (s.iron ? 0.15 : 0.05), 0, 1) * 100);
  return { energy: Math.round(energy), pain: Math.round(pain), mood: Math.round(mood), score };
}

// ---------- alerts ----------
export function alerts(cc: ReturnType<typeof currentCycle>, logs: DayLog[], profile: Profile | null) {
  const out: { tone: "info" | "warn"; text: string }[] = [];
  if (!cc) return out;
  if (cc.late) out.push({ tone: "warn", text: `Your period may be late (day ${cc.day} of a ~${cc.cycleLen}-day cycle). Stress and sleep can shift timing.` });
  else if (cc.daysToPeriod > 0 && cc.daysToPeriod <= 5) out.push({ tone: "info", text: `PMS may start in about ${Math.max(cc.daysToPeriod - 2, 0)} days — stock up on comfort snacks and magnesium.` });
  if (cc.daysToOvulation >= 0 && cc.daysToOvulation <= 3) out.push({ tone: "info", text: `Ovulation expected in ${cc.daysToOvulation} day(s). Energy usually peaks now.` });
  const recent = logs.slice(-7);
  const iron = recent.filter((l) => l.nutrients?.includes("Iron")).length;
  if (recent.length >= 3 && iron < 3) out.push({ tone: "warn", text: "Low-iron risk: only " + iron + " iron-rich days this week. Try spinach, dates or jaggery." });
  const sleep = recent.reduce((a, l) => a + (l.sleepHours ?? 7), 0) / (recent.length || 1);
  if (recent.length >= 3 && sleep < 6.5) out.push({ tone: "warn", text: `Averaging ${sleep.toFixed(1)}h sleep — your twin predicts lower energy and stronger cramps.` });
  if (profile?.conditions.includes("Anemia")) out.push({ tone: "info", text: "You noted anemia — pair iron foods with vitamin C (lemon, amla) for better absorption." });
  return out;
}

// ---------- demo data ----------
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function buildDemo() {
  const r = rng(42);
  const profile: Profile = {
    name: "Ananya", age: 19, height: 160, weight: 54, cycleLength: 29, irregular: false, periodLength: 5,
    activity: "moderate", diet: "veg", sleep: 7, conditions: [], goals: ["Less cramps", "More energy", "Better sleep"],
  };
  const lens = [30, 27, 29, 31, 28, 29];
  const now = new Date();
  let start = subDays(now, 17);
  const periods: string[] = [iso(start)];
  for (let i = lens.length - 1; i >= 0; i--) {
    start = subDays(start, lens[i]);
    periods.unshift(iso(start));
  }
  const logs: Record<string, DayLog> = {};
  const sorted = [...periods];
  for (let d = differenceInCalendarDays(now, parseISO(sorted[0])); d >= 0; d--) {
    const date = subDays(now, d);
    const ds = iso(date);
    const last = sorted.filter((p) => p <= ds).pop()!;
    const idx = sorted.indexOf(last);
    const len = lens[idx] ?? 29;
    const day = differenceInCalendarDays(date, parseISO(last)) + 1;
    const phase = phaseFor(day, len, 5);
    const sleepHours = Math.round((5.5 + r() * 3) * 2) / 2;
    const stress = Math.round(2 + r() * 6);
    const lowSleep = sleepHours < 6.5;
    const sym: string[] = [];
    if (phase === "Menstrual" && day <= 3) sym.push("Cramps");
    if (phase === "Menstrual" && r() > 0.5) sym.push("Back pain");
    if (phase === "Luteal" && day > len - 5) { if (r() > 0.3) sym.push("Bloating"); if (r() > 0.4) sym.push("Cravings"); if (r() > 0.6) sym.push("Acne"); }
    if (lowSleep && r() > 0.5) sym.push("Headache");
    if (phase === "Ovulation" && r() > 0.5) sym.push("Discharge");
    const flow = phase === "Menstrual" ? ([3, 3, 2, 1, 1][day - 1] as 1 | 2 | 3) : 0;
    const exerciseMin = r() > 0.35 ? Math.round(10 + r() * 40) : 0;
    logs[ds] = {
      date: ds, flow, clots: flow === 3 && r() > 0.6,
      pain: phase === "Menstrual" ? Math.min(10, Math.round(3 + r() * 4 + (lowSleep ? 2 : 0))) : Math.round(r() * 2),
      mood: Math.max(1, Math.min(5, Math.round((phase === "Ovulation" || phase === "Follicular" ? 4 : 3) + (r() - 0.5) * 2 - (stress > 6 ? 1 : 0)))),
      energy: Math.max(1, Math.min(5, Math.round((phase === "Menstrual" ? 2.5 : phase === "Ovulation" ? 4.5 : 3.5) + (r() - 0.5) * 1.5 - (lowSleep ? 1 : 0)))),
      stress, anxiety: Math.round(stress * 0.8),
      water: Math.round(4 + r() * 5),
      nutrients: NUTRIENTS.filter(() => r() > 0.45),
      sugar: Math.round(r() * 3), caffeine: Math.round(r() * 2),
      sleepHours, sleepQuality: Math.max(1, Math.min(5, Math.round(sleepHours - 3))),
      exerciseType: exerciseMin ? ["Yoga", "Walk", "Dance", "Strength"][Math.floor(r() * 4)] : undefined,
      exerciseMin, steps: Math.round(3000 + r() * 7000),
      symptoms: sym, weight: 54 + Math.round((r() - 0.5) * 10) / 10,
      temperature: phase === "Luteal" ? 36.8 : 36.5,
      pads: flow ? flow + 1 : 0, product: flow ? (r() > 0.7 ? "cup" : "pad") : undefined,
    };
  }
  return { profile, periods, logs };
}
