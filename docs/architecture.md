🌸 CycleTwin — A Digital Twin of Menstrual & Overall Wellness

Tagline: Understand Your Cycle. Track Your Wellness. Make Informed Decisions.
Name		
Purva Jasrotia 
Seema Yadav

Team Name: purvawinwin

1. Project Overview
CycleTwin is a digital wellness platform designed to help users track menstrual cycles, record symptoms, monitor wellness indicators, and understand personal patterns over time.
The platform aims to provide adaptive cycle predictions, wellness insights, risk-awareness features, and conversational assistance in one place
Menstrual health is poorly understood and rarely tracked in a useful way, especially among teenagers and young women.

3. Problem Statement
Most period apps only log dates and predict with a fixed 28-day cycle, which fails for irregular cycles.
Symptoms, sleep, nutrition, stress and hydration are tracked separately, so patterns like "cramps get worse on low-sleep days" stay invisible.
Early signs of conditions such as PCOS, thyroid issues and anemia often go unnoticed because girls feel too shy or uninformed to seek help.
Doctors receive scattered, memory-based histories instead of clear data.
Existing tools feel clinical or intrusive, with weak privacy and little regional-language support.
CycleTwin solves this by turning daily 60-second logs into a personalized, predictive "twin" of her body, with privacy and consent built in.

4. Healthcare Use Case

Target users: teens and young women, doctors (gynecologists, nutritionists), and institutions (schools, colleges, NGOs).
How it works in practice:
A student onboards with her age, cycle length, activity, diet and conditions.
She logs flow, pain, mood, sleep, food and exercise with quick taps.
The twin updates her Cycle Ring, predicts the next period and ovulation using her recent 3-6 cycles, and raises gentle alerts ("period may be late", "PMS in 3 days", "low-iron risk").
The What-if Simulator shows how changes in sleep, exercise, water, stress or iron-rich food could change her predicted energy, pain, mood and wellness score.
The Risk Screener shows a low/medium/high pattern indicator for PCOS, thyroid and anemia, always with "please consult a doctor".
Doctor Mode produces a one-page summary and a consent-based, read-only share link.
Institutions see anonymous aggregate analytics only (never individual data).

Impact: earlier awareness of irregular patterns, better doctor conversations, phase-synced Indian-friendly nutrition and wellness plans, and menstrual health education in English, Hindi and regional languages.
Key features: Cycle Ring, Wellness Score, Twin Health Age, Digital Twin body view with hormone chart, Insights and monthly PDF report, Calendar, Wellness Plans, Ask Twin AI chat (voice, multilingual), Mental Wellness, Risk Screener, Rewards, Hygiene Tracker, Doctor Mode, Learn, Care (helplines 112, 181, 14416), Wearable and CSV import/export, Privacy controls.

5.Technical Stack
Layer	Technology
Frontend	React, TypeScript, Tailwind CSS, React Router
Charts	Recharts (line, radar, heatmap, bar, donut)
Backend / Auth / Storage	Supabase, with localStorage fallback
App type	Progressive Web App (PWA), mobile-first, light/dark mode
AI	LLM-powered "Ask Twin" assistant [confirm provider/model]
Built with	Lovable, VS Code, GitHub
Hosting	[e.g., Lovable / Vercel / Netlify]

6.AI/ML Model or Framework Details

CycleTwin combines transparent, explainable logic with a conversational AI layer.

Adaptive cycle prediction: uses a rolling average of the last 3-6 cycles instead of a fixed 28 days.
Wellness Score (0-100): weighted mix of sleep, nutrition, activity, stress, regularity and hydration.
Twin Health Age: derived from the Wellness Score.
Hormone estimation: estrogen, progesterone, LH and FSH curves estimated from the cycle phase model (illustrative, not lab-measured).
What-if Simulator: recalculates predicted energy, pain, mood and score against her baseline.
Risk Screener: rule-based pattern indicators (low/medium/high) for PCOS, thyroid and anemia. It is not a diagnosis.
Ask Twin: LLM chat that answers using her logged data, with voice input and English, Hindi and regional languages. 

7.Business Model
Free: tracking, daily log, predictions, calendar, education.
Premium (₹149/month or ₹999/year, 7-day trial): Ask Twin, What-if Simulator, full reports and PDF, meal/workout plans, regional languages, Doctor Mode, Risk Screener, wearable import.
Institution: from ₹49/student/year, anonymous aggregate analytics only.
Other streams: doctor consult commission (20%), clearly labeled affiliate shop and sponsorships, grants/CSR, anonymized consent-based research insights.

8.Privacy & Trust
Individual data is never sold. There are no ads inside health logs or doctor summaries. 
The app offers PIN lock, Incognito mode, per-use consent toggles, data export and one-tap delete, aligned with India's DPDP Act.

9.
