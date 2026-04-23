/**
 * SAS-SV — Smartphone Addiction Scale (Short Version)
 *
 * Source: Kwon M, Kim DJ, Cho H, Yang S. (2013). The Smartphone Addiction Scale:
 * Development and Validation of a Short Version for Adolescents.
 * PLoS ONE 8(12): e83558. https://doi.org/10.1371/journal.pone.0083558
 *
 * Original instrument (English) is published under CC-BY in PLoS ONE.
 *
 * French translation: forward-only translation by the project team (2026-04-23)
 * from Kwon's English original. Backward translation pending — see
 * docs/decisions/003-sas-sv-translation.md for the validation procedure and
 * status. Until backward translation is complete, label this version
 * "Pre-validated FR adaptation" wherever it is shown to teachers / researchers.
 *
 * Symptom mapping derived from Lopez-Fernandez O. (2017).
 * Short version of the Smartphone Addiction Scale adapted to Spanish and French.
 * Addictive Behaviors, 64, 275-280. https://doi.org/10.1016/j.addbeh.2015.11.013
 *
 * Cutoff scores (Kwon et al. 2013):
 *   - Male:   total ≥ 31  → potential problematic use
 *   - Female: total ≥ 33  → potential problematic use
 * For school-age use we expose `risk_band` ("low" / "moderate" / "high")
 * rather than gender-specific cutoffs to avoid asking gender at intake.
 */

export type SasSymptom =
  | "loss_of_control"
  | "disruption"
  | "disregard"
  | "withdrawal"
  | "preoccupation"
  | "tolerance";

export type RiskBand = "low" | "moderate" | "high";

export interface SasItem {
  /** 1-indexed item number, matches Kwon 2013 numbering. */
  id: number;
  /** Symptom this item maps to (per Lopez-Fernandez 2017). */
  symptom: SasSymptom;
  /** French translation — forward translation from Kwon 2013 EN original. */
  fr: string;
  /** English original from Kwon 2013, kept for audit + bilingual UI. */
  en: string;
}

export const SAS_SV_ITEMS: readonly SasItem[] = [
  {
    id: 1,
    symptom: "disruption",
    fr: "Il m'arrive de manquer un travail prévu à cause de l'utilisation de mon smartphone.",
    en: "Missing planned work due to smartphone use",
  },
  {
    id: 2,
    symptom: "disruption",
    fr: "J'ai du mal à me concentrer en classe, en faisant mes devoirs ou au travail à cause de mon smartphone.",
    en: "Having a hard time concentrating in class, while doing assignments, or while working due to smartphone use",
  },
  {
    id: 3,
    symptom: "disregard",
    fr: "Je ressens des douleurs aux poignets ou à la nuque lorsque j'utilise mon smartphone.",
    en: "Feeling pain in the wrists or at the back of the neck while using a smartphone",
  },
  {
    id: 4,
    symptom: "withdrawal",
    fr: "Je ne supporterais pas de ne pas avoir mon smartphone.",
    en: "Won't be able to stand not having a smartphone",
  },
  {
    id: 5,
    symptom: "withdrawal",
    fr: "Je me sens impatient(e) et agacé(e) quand je n'ai pas mon smartphone en main.",
    en: "Feeling impatient and fretful when I am not holding my smartphone",
  },
  {
    id: 6,
    symptom: "preoccupation",
    fr: "Mon smartphone occupe mes pensées même lorsque je ne l'utilise pas.",
    en: "Having my smartphone in my mind even when I am not using it",
  },
  {
    id: 7,
    symptom: "disregard",
    fr: "Je n'arrêterai jamais d'utiliser mon smartphone, même si ma vie quotidienne en est déjà fortement affectée.",
    en: "I will never give up using my smartphone even when my daily life is already greatly affected by it",
  },
  {
    id: 8,
    symptom: "loss_of_control",
    fr: "Je vérifie sans arrêt mon smartphone pour ne pas rater les conversations des autres sur les réseaux sociaux (par exemple Instagram, Snapchat, TikTok).",
    en: "Constantly checking my smartphone so as not to miss conversations between other people on Twitter or Facebook",
  },
  {
    id: 9,
    symptom: "tolerance",
    fr: "J'utilise mon smartphone plus longtemps que je ne l'avais prévu.",
    en: "Using my smartphone longer than I had intended",
  },
  {
    id: 10,
    symptom: "loss_of_control",
    fr: "Mon entourage me dit que j'utilise trop mon smartphone.",
    en: "The people around me tell me that I use my smartphone too much",
  },
] as const;

/**
 * 6-point Likert scale (Strongly disagree → Strongly agree).
 * `value` is the numeric weight used for scoring; labels are FR-primary.
 */
export const SAS_SV_LIKERT = [
  { value: 1, fr: "Pas du tout d'accord", en: "Strongly disagree" },
  { value: 2, fr: "Plutôt pas d'accord", en: "Disagree" },
  { value: 3, fr: "Légèrement pas d'accord", en: "Weakly disagree" },
  { value: 4, fr: "Légèrement d'accord", en: "Weakly agree" },
  { value: 5, fr: "Plutôt d'accord", en: "Agree" },
  { value: 6, fr: "Tout à fait d'accord", en: "Strongly agree" },
] as const;

export const SAS_SV_MIN_SCORE = SAS_SV_ITEMS.length * 1; // 10
export const SAS_SV_MAX_SCORE = SAS_SV_ITEMS.length * 6; // 60

/**
 * Compute total score from an answer map.
 * Throws if any item is missing — call only when survey is complete.
 */
export function computeScore(answers: Record<number, number>): number {
  let total = 0;
  for (const item of SAS_SV_ITEMS) {
    const v = answers[item.id];
    if (typeof v !== "number" || v < 1 || v > 6) {
      throw new Error(`SAS-SV: missing or invalid answer for item ${item.id}`);
    }
    total += v;
  }
  return total;
}

/**
 * Derive a non-stigmatising risk band from total score.
 * Thresholds chosen to be gender-neutral and conservative:
 *   - low:      10–21  (no concerning pattern)
 *   - moderate: 22–30  (above average usage; reflect on habits)
 *   - high:     31–60  (Kwon's male cutoff; may benefit from support)
 *
 * Wording in UI must avoid clinical labels ("addicted", "addict") —
 * frame as "habitudes" and "à examiner / à accompagner".
 */
export function riskBand(score: number): RiskBand {
  if (score >= 31) return "high";
  if (score >= 22) return "moderate";
  return "low";
}

/**
 * Per-symptom subscores — useful for the result page to show *which*
 * dimension drives a high total (e.g. high "withdrawal" vs. high "tolerance"
 * suggests different reflective questions).
 */
export function symptomBreakdown(
  answers: Record<number, number>,
): Record<SasSymptom, number> {
  const acc: Record<SasSymptom, number> = {
    loss_of_control: 0,
    disruption: 0,
    disregard: 0,
    withdrawal: 0,
    preoccupation: 0,
    tolerance: 0,
  };
  for (const item of SAS_SV_ITEMS) {
    const v = answers[item.id] ?? 0;
    acc[item.symptom] += v;
  }
  return acc;
}
