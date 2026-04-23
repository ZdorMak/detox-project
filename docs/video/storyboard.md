# Interactive experience storyboard — "Une soirée"

**Format:** code-driven scene (Lottie + Framer Motion + typed text), not a video file. See ADR-004.

**Total runtime:** 2.5 – 3.5 min depending on choices made.

**Tone:** non-judgemental, observational, slightly cinematic. No "addict" / "addicted" language. The user is the protagonist; we never tell them what to feel.

**Scenes:** 5 sequential, with 2 branching points (3 paths through). Each scene = 25–45 s.

---

## Scene 1 — "20h47, ta chambre" (linear, 30 s)

**Visual (Lottie):** Empty bedroom desk, schoolbooks open, soft lamp light. Phone face-down on the desk, screen pulsing faintly with notifications behind a translucent overlay.

**Narration (FR, typed-out, ~4 lignes):**
> Tu rentres de l'école.
> Demain, contrôle de math.
> Le téléphone vibre une fois, puis encore.
> Trois nouveaux messages. Une notification Insta. Un live TikTok.

**Mood:** calm, observational. Soft ambient (optional voiceover).

**Telemetry:** `event_type: "scene_enter"` with `metadata: { scene: "evening_room" }`.

---

## Scene 2 — **Choice point 1** (15 s of decision time + 25 s of branch)

**Prompt (centered, large):**
> *Tu fais quoi ?*

**Two options (large buttons, equal weight, no "right answer"):**
- **A. Je regarde — juste 5 minutes.** → branch to **Scene 3a**
- **B. Je le retourne et je commence à réviser.** → branch to **Scene 3b**

**Telemetry:** `event_type: "branch_choice"`, `metadata: { point: 1, choice: "A" | "B" }`.

---

## Scene 3a — "Le rabbit hole" (chosen "5 minutes") (35 s)

**Visual:** Lottie of a feed scrolling, time-display in corner ticking from 20:47 → 22:13, schoolbook progressively dimming, notifications stacking.

**Narration:**
> 20h47. Tu déverrouilles.
> Vidéo, vidéo, vidéo. Une amie en story.
> Tu réponds vite. Tu scrolles encore.
> 22h13. Tu poses le téléphone. Le contrôle de math est dans onze heures.

**Telemetry:** `event_type: "scene_enter"`, scene `"rabbit_hole"`. `event_type: "scene_complete"` at end.

---

## Scene 3b — "Le silence" (chosen "réviser") (35 s)

**Visual:** Lottie of phone face-down, schoolbook with notes appearing, focused close-up. Time ticks 20:47 → 21:35. The phone occasionally pulses, but stays still.

**Narration:**
> 20h47. Le téléphone est posé, écran contre la table.
> Tu lis. Un calcul. Un autre.
> Une notification clignote. Tu hésites une seconde.
> 21h35. Tu fermes le livre. Tu te sens un peu fatigué·e — mais préparé·e.

**Telemetry:** `event_type: "scene_enter"`, scene `"silence"`. `event_type: "scene_complete"` at end.

---

## Scene 4 — **Choice point 2** (after either 3a or 3b) (15 s + 35 s)

**Prompt:**
> *Le matin, à l'arrêt de bus. Tes amis te montrent un mème. Le téléphone vibre encore.*
> *Comment tu veux passer les vingt prochaines minutes ?*

**Two options:**
- **A. Je sors le téléphone aussi — c'est plus simple.** → Scene 5a
- **B. Je le laisse dans ma poche et j'écoute.** → Scene 5b

**Telemetry:** `event_type: "branch_choice"`, `metadata: { point: 2, choice }`.

---

## Scene 5a — "L'écran partagé" (35 s)

**Visual:** Group of stylised silhouettes around a phone screen, the screen glowing brighter than their faces. Audio: muted ambient.

**Narration:**
> Tu sors le téléphone.
> Vous riez à trois sur la même vidéo.
> Personne ne se regarde vraiment.
> Le bus arrive. Tu n'as pas entendu ce que disait Léa.

**End beat:** soft fade.

---

## Scene 5b — "L'écoute" (35 s)

**Visual:** Two silhouettes facing each other, phone in pocket suggested by faint pulse near the hip, eye contact emphasised.

**Narration:**
> Le téléphone vibre. Tu le sens.
> Léa te raconte sa dispute avec sa sœur.
> Tu poses une question. Elle répond longuement.
> Le bus arrive. Tu sais des choses sur sa vie que tu ne savais pas hier.

**End beat:** soft fade.

---

## Closing card — "Et toi ?" (15 s, no choice)

**Visual:** Static gradient with text fading in.

**Text:**
> *Aucune de ces histoires n'est "la bonne".*
> *Mais chaque petit choix construit ton rapport au téléphone.*
>
> *On va te poser dix questions pour mieux comprendre le tien.*

**CTA button:** **Commencer le questionnaire →** (FR) / **Start the questionnaire →** (EN)

→ `router.push("/survey")`. Telemetry: `event_type: "experience_complete"`.

---

## Accessibility notes

- All narration is text-first. Lottie animations are decorative (`aria-hidden="true"`). The main `<article>` carries `aria-live="polite"` so a screen reader announces new lines.
- Choice buttons: WCAG 2.1 AA contrast, 44×44 px minimum tap target, full keyboard navigation (Tab + Enter + 1/2 number keys).
- `prefers-reduced-motion`: typed-out animation collapses to instant text reveal; Lottie animations switch to a static frame.
- Optional voiceover via Web Speech API: respects `speechSynthesis.cancel()` on scene change; OFF by default with a toggle, since the feature is best-effort across browsers.

## Pillar coverage

| Pillar | How |
|---|---|
| Innovation | Real branching state, not video-overlay hacks |
| Smartphone | Mobile-first viewport, 60 fps Lottie at 200 KB |
| Addiction | Non-stigmatising, observational tone — no labels |
| Accessible | Text-first + reduced-motion + keyboard + ARIA |
| Durable | Zero external paid services; Lottie files in `public/` |
| Interdisciplinaire | UX + narrative + behavioural cues |
| Collaboration | Telemetry feeds the teacher dashboard (W4-2) |

## TODO before SOUK

- [ ] Replace the placeholder Lottie URLs in `experienceConfig.ts` with curated assets from LottieFiles (or hand-drawn — see assets pipeline).
- [ ] FR voiceover: pilot Web Speech API quality on iOS Safari (worst case) — if too robotic, fall back to ElevenLabs FR Bella (~$5/month, 30k chars).
- [ ] Have one HEFP classmate read all FR narration aloud — flag awkward phrasing.
