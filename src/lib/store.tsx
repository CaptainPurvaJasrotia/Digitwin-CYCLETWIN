import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildDemo, currentCycle, cycleStats, scoreParts, twinAge, wellnessScore, type DayLog, type Profile } from "./cycle";

export interface Settings { largeText: boolean; incognito: boolean; dark: boolean; colorSafe: boolean; pin: string; consents: Record<string, boolean> }
export interface AppState {
  profile: Profile | null;
  periods: string[];
  logs: Record<string, DayLog>;
  demo: boolean;
  premium: boolean;
  journal: { date: string; text: string }[];
  settings: Settings;
}

const KEY = "cycletwin.v1";
const defaults: AppState = {
  profile: null, periods: [], logs: {}, demo: false, premium: false, journal: [],
  settings: { largeText: false, incognito: false, dark: false, colorSafe: false, pin: "", consents: { insights: true, research: false, doctor: true } },
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const p = JSON.parse(raw);
    return { ...defaults, ...p, settings: { ...defaults.settings, ...p.settings } };
  } catch {
    return defaults;
  }
}

interface Ctx {
  state: AppState;
  ready: boolean;
  set: (fn: (s: AppState) => AppState) => void;
  loadDemo: () => void;
  exitDemo: () => void;
  reset: () => void;
}
const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => { setState(load()); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
    const r = document.documentElement;
    r.classList.toggle("dark", state.settings.dark);
    r.classList.toggle("large-text", state.settings.largeText);
    r.classList.toggle("color-safe", state.settings.colorSafe);
  }, [state, ready]);

  const value = useMemo<Ctx>(() => ({
    state, ready,
    set: (fn) => setState((s) => fn(s)),
    loadDemo: () => {
      try {
        const d = buildDemo();
        setState((s) => ({ ...s, ...d, demo: true, premium: true, journal: [{ date: d.periods[d.periods.length - 1] ?? "", text: "Grateful for my friends who brought me chai on a crampy day." }] }));
      } catch (e) {
        console.error("demo failed", e);
      }
    },
    exitDemo: () => setState((s) => ({ ...defaults, settings: s.settings })),
    reset: () => { localStorage.removeItem(KEY); setState(defaults); },
  }), [state, ready]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

/** Derived numbers used across pages. */
export function useTwin() {
  const { state } = useApp();
  return useMemo(() => {
    const logList = Object.values(state.logs).sort((a, b) => a.date.localeCompare(b.date));
    const stats = cycleStats(state.periods, state.profile);
    const cc = currentCycle(state.periods, state.profile);
    const parts = scoreParts(logList.slice(-7), stats.regularity);
    const score = logList.length ? wellnessScore(parts) : 0;
    const age = state.profile?.age ?? 18;
    return { logList, stats, cc, parts, score, twinAge: twinAge(age, score || 70), age };
  }, [state.logs, state.periods, state.profile]);
}
