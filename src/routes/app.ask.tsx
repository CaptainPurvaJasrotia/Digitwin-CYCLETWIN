import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Glass, NeedsProfile, PageHeader, Premium, meta } from "@/components/ct/ui";
import { useTwin } from "@/lib/store";
import { PHASE_META } from "@/lib/cycle";

export const Route = createFileRoute("/app/ask")({
  head: () => ({ meta: meta("Ask Twin", "Chat with your twin about your cycle, symptoms and habits — in English, Hindi, Tamil or Bengali.") }),
  component: () => <NeedsProfile><Premium feature="Ask Twin"><Ask /></Premium></NeedsProfile>,
});

const LANGS = { en: "English", hi: "हिन्दी", ta: "தமிழ்", bn: "বাংলা" } as const;
type Lang = keyof typeof LANGS;
const SUGGEST = ["When is my next period?", "Why am I so tired?", "What should I eat today?", "Are my cramps normal?"];

function Ask() {
  const t = useTwin();
  const [lang, setLang] = useState<Lang>("en");
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: "Hi! I'm your twin. I know your logs — ask me anything about your cycle 💗" }]);
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const rec = useRef<{ stop: () => void } | null>(null);

  const answer = (question: string) => {
    const s = question.toLowerCase();
    const cc = t.cc!;
    const last = t.logList.slice(-7);
    const sleep = (last.reduce((a, l) => a + (l.sleepHours ?? 7), 0) / (last.length || 1)).toFixed(1);
    let en: string; let hi: string;
    if (/period|next|late|माहवारी|पीरियड/.test(s)) { en = `Based on your last cycles (avg ${cc.cycleLen} days), your next period is expected around ${format(cc.nextPeriod, "d MMM")} — ${cc.daysToPeriod} days away.`; hi = `आपके पिछले चक्रों (औसत ${cc.cycleLen} दिन) के अनुसार अगला पीरियड लगभग ${format(cc.nextPeriod, "d MMM")} को, यानी ${cc.daysToPeriod} दिन में आ सकता है।`; }
    else if (/tired|energy|थक/.test(s)) { en = `You're in your ${cc.phase} phase and averaging ${sleep}h sleep this week. ${+sleep < 7 ? "An extra hour of sleep could lift energy noticeably." : "Your sleep looks good — try iron-rich foods and a short walk."}`; hi = `आप ${cc.phase} चरण में हैं और इस हफ्ते औसतन ${sleep} घंटे सो रही हैं। ${+sleep < 7 ? "एक घंटा ज़्यादा नींद ऊर्जा बढ़ा सकती है।" : "नींद अच्छी है — आयरन वाला खाना और थोड़ी सैर आज़माएँ।"}`; }
    else if (/eat|food|खा/.test(s)) { en = PHASE_META[cc.phase].tip; hi = "आज पालक, रागी, गुड़, खजूर और दही जैसे आयरन व कैल्शियम से भरपूर खाने चुनें।"; }
    else if (/cramp|pain|दर्द/.test(s)) { const p = last.filter((l) => (l.pain ?? 0) >= 7).length; en = `Mild to moderate cramps are common. You had ${p} high-pain days this week. ${p > 2 ? "If pain stops you from daily life, please consult a doctor." : "Heat, gentle yoga and hydration usually help."}`; hi = `हल्के ऐंठन आम हैं। इस हफ्ते ${p} दिन तेज़ दर्द रहा। ${p > 2 ? "अगर दर्द रोज़मर्रा में रुकावट डाले तो डॉक्टर से ज़रूर मिलें।" : "गर्म सिकाई, हल्का योग और पानी मदद करते हैं।"}`; }
    else { en = `Today is day ${cc.day} (${cc.phase}). Your wellness score is ${t.score}. Ask me about periods, energy, food or cramps!`; hi = `आज चक्र का दिन ${cc.day} (${cc.phase}) है। आपका वेलनेस स्कोर ${t.score} है। पीरियड, ऊर्जा, खाना या दर्द के बारे में पूछें!`; }
    const out = lang === "hi" ? hi : lang === "en" ? en : `${en}\n\n(${LANGS[lang]} translation coming soon)`;
    return out + "\n\n— Educational info, not a diagnosis.";
  };
  const send = (text = q) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { me: true, text }, { me: false, text: answer(text) }]);
    setQ("");
  };
  const voice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input isn't supported in this browser."); return; }
    if (listening) { rec.current?.stop(); return; }
    const r = new SR(); r.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "bn" ? "bn-IN" : "en-IN";
    r.onresult = (e: { results: { 0: { transcript: string } }[] }) => send(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ask Twin" sub="Answers use your own logged data.">
        <div className="flex gap-1">{(Object.keys(LANGS) as Lang[]).map((l) => <Button key={l} size="sm" variant={lang === l ? "default" : "outline"} onClick={() => setLang(l)}>{LANGS[l]}</Button>)}</div>
      </PageHeader>
      <Glass className="flex h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {msgs.map((m, i) => <div key={i} className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm animate-rise ${m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.text}</div>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1 text-xs hover:bg-secondary">{s}</button>)}</div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <Button type="button" size="icon" variant={listening ? "default" : "outline"} onClick={voice} aria-label="Voice input"><Mic /></Button>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask your twin…" />
          <Button type="submit" size="icon" aria-label="Send"><Send /></Button>
        </form>
      </Glass>
    </div>
  );
}
