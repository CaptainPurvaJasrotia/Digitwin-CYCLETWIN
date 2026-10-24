import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Glass, NeedsProfile, PageHeader, Premium, meta } from "@/components/ct/ui";
import { useTwin } from "@/lib/store";
import type { Phase } from "@/lib/cycle";

export const Route = createFileRoute("/app/plans")({
  head: () => ({ meta: meta("Wellness plans", "Phase-synced Indian meals, grocery lists, workouts, study plans and sleep tips.") }),
  component: () => <NeedsProfile><Premium feature="Meal & workout plans"><Plans /></Premium></NeedsProfile>,
});

const PLAN: Record<Phase, { meals: [string, string, string[]][]; workout: string[]; study: string; sleep: string }> = {
  Menstrual: { meals: [["Breakfast", "Ragi porridge with jaggery & dates", ["ragi flour", "jaggery", "dates", "milk"]], ["Lunch", "Palak dal with brown rice", ["spinach", "toor dal", "brown rice"]], ["Snack", "Warm haldi doodh + roasted chana", ["turmeric", "chana"]], ["Dinner", "Moong khichdi with curd", ["moong dal", "rice", "curd"]]], workout: ["Gentle yoga: child's pose, cat-cow (15 min)", "Slow walk 20 min", "Hot water bag + breathwork"], study: "Review & light reading. Short 25-min sessions with long breaks.", sleep: "Aim 8–9h. Warm bath, no screens 30 min before bed." },
  Follicular: { meals: [["Breakfast", "Besan chilla with mint chutney", ["besan", "mint", "onion"]], ["Lunch", "Rajma bowl with salad", ["rajma", "cucumber", "tomato"]], ["Snack", "Sprouts chaat", ["moong sprouts", "lemon"]], ["Dinner", "Paneer bhurji + multigrain roti", ["paneer", "atta"]]], workout: ["Strength training 30 min", "Skipping 10 min", "Try a new dance class"], study: "Start new topics and projects — focus and memory are high.", sleep: "7–8h. Morning sunlight boosts rising energy." },
  Ovulation: { meals: [["Breakfast", "Fruit & curd bowl with flaxseed", ["curd", "banana", "flaxseed"]], ["Lunch", "Quinoa pulao with veggies", ["quinoa", "peas", "carrot"]], ["Snack", "Coconut water + almonds", ["coconut water", "almonds"]], ["Dinner", "Grilled fish / tofu tikka + salad", ["tofu", "capsicum"]]], workout: ["HIIT 20 min", "Run or sport", "Power yoga"], study: "Presentations, group work, exams — communication peaks.", sleep: "7–8h. Hydrate well, energy may keep you up late." },
  Luteal: { meals: [["Breakfast", "Sweet potato chaat", ["sweet potato", "chaat masala"]], ["Lunch", "Bajra roti, methi sabzi & dal", ["bajra", "methi", "masoor dal"]], ["Snack", "Dark chocolate + pumpkin seeds", ["dark chocolate", "pumpkin seeds"]], ["Dinner", "Vegetable upma with curd", ["rava", "vegetables", "curd"]]], workout: ["Pilates 25 min", "Brisk walk 30 min", "Yin yoga"], study: "Finish & organise. Detail work and editing suit this phase.", sleep: "8h. Magnesium foods and chamomile help with PMS restlessness." },
};

function Plans() {
  const { cc } = useTwin();
  const [phase, setPhase] = useState<Phase>(cc!.phase);
  const p = PLAN[phase];
  const grocery = Array.from(new Set(p.meals.flatMap((m) => m[2])));
  return (
    <div>
      <PageHeader title="Wellness plans" sub={`You're in your ${cc!.phase} phase. Plans are synced to your cycle.`} />
      <Tabs value={phase} onValueChange={(v) => setPhase(v as Phase)}>
        <TabsList>{(Object.keys(PLAN) as Phase[]).map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}</TabsList>
        <TabsContent value={phase} className="mt-5 grid gap-5 lg:grid-cols-3">
          <Glass className="lg:col-span-2">
            <h3 className="font-semibold">Today's meals</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{p.meals.map(([t, m]) => <div key={t} className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">{t}</div><div className="font-medium">{m}</div></div>)}</div>
          </Glass>
          <Glass>
            <div className="flex items-center justify-between"><h3 className="font-semibold">Grocery list</h3><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(grocery.join("\n")); toast.success("Copied grocery list"); }}><Copy className="h-4 w-4" /></Button></div>
            <ul className="mt-2 space-y-1 text-sm">{grocery.map((g) => <li key={g}>☐ {g}</li>)}</ul>
          </Glass>
          <Glass><h3 className="font-semibold">Movement</h3><ul className="mt-2 space-y-1 text-sm">{p.workout.map((w) => <li key={w}>• {w}</li>)}</ul></Glass>
          <Glass><h3 className="font-semibold">Study & work</h3><p className="mt-2 text-sm">{p.study}</p></Glass>
          <Glass><h3 className="font-semibold">Sleep & stress</h3><p className="mt-2 text-sm">{p.sleep}</p></Glass>
        </TabsContent>
      </Tabs>
    </div>
  );
}
