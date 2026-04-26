/**
 * Persona system — assigns a memorable archetype to the user based on
 * their SAS-SV result. Inspired by 16personalities' MBTI types: gives
 * the result a face + a name, so the takeaway is "I'm Le Connecteur"
 * not "I scored 27".
 *
 * 9 personas = 3 risk bands × 3 dominant symptom families.
 * Always derived deterministically from `result.band` + the symptom
 * with the highest normalised subscore.
 */

import type { RiskBand, SasSymptom } from "./sas-sv";

export type PersonaId =
  | "le_serene"           // low band — reflection / preoccupation low
  | "le_curieux"          // low band — observation / loss_of_control low
  | "le_connecteur_calme" // low band — social / withdrawal low
  | "le_chercheur"        // moderate band — reflection-leaning
  | "le_jongleur"         // moderate band — disruption-leaning
  | "le_curieux_actif"    // moderate band — observation/social-leaning
  | "le_capte"            // high band — loss_of_control-leaning
  | "le_disperse"         // high band — disruption-leaning
  | "lhyperconnecte";     // high band — withdrawal/preoccupation-leaning

export interface PersonaDef {
  id: PersonaId;
  band: RiskBand;
  emoji: string;
  /** Tailwind-friendly hex pair for the gradient header. */
  fromColor: string;
  toColor: string;
  /** Accent color for buttons / pills. */
  accent: string;
}

export const PERSONAS: Readonly<Record<PersonaId, PersonaDef>> = {
  le_serene: {
    id: "le_serene", band: "low", emoji: "🌿",
    fromColor: "#10b981", toColor: "#0ea5e9", accent: "#10b981",
  },
  le_curieux: {
    id: "le_curieux", band: "low", emoji: "🔭",
    fromColor: "#06b6d4", toColor: "#22c55e", accent: "#06b6d4",
  },
  le_connecteur_calme: {
    id: "le_connecteur_calme", band: "low", emoji: "🤝",
    fromColor: "#14b8a6", toColor: "#84cc16", accent: "#14b8a6",
  },
  le_chercheur: {
    id: "le_chercheur", band: "moderate", emoji: "🧭",
    fromColor: "#f59e0b", toColor: "#0ea5e9", accent: "#f59e0b",
  },
  le_jongleur: {
    id: "le_jongleur", band: "moderate", emoji: "🤹",
    fromColor: "#f97316", toColor: "#ec4899", accent: "#f97316",
  },
  le_curieux_actif: {
    id: "le_curieux_actif", band: "moderate", emoji: "🌗",
    fromColor: "#eab308", toColor: "#a855f7", accent: "#eab308",
  },
  le_capte: {
    id: "le_capte", band: "high", emoji: "🌀",
    fromColor: "#f43f5e", toColor: "#a855f7", accent: "#f43f5e",
  },
  le_disperse: {
    id: "le_disperse", band: "high", emoji: "💫",
    fromColor: "#ef4444", toColor: "#f97316", accent: "#ef4444",
  },
  lhyperconnecte: {
    id: "lhyperconnecte", band: "high", emoji: "📡",
    fromColor: "#dc2626", toColor: "#7c3aed", accent: "#dc2626",
  },
};

/** Family grouping — maps each symptom to a "facet" for persona selection. */
const SYMPTOM_FAMILY: Record<SasSymptom, "control" | "disruption" | "connection" | "calm"> = {
  loss_of_control: "control",
  disruption: "disruption",
  preoccupation: "calm",
  withdrawal: "control",
  tolerance: "control",
  disregard: "disruption",
};

export function pickPersona(
  band: RiskBand,
  bySymptom: Record<SasSymptom, number>,
): PersonaDef {
  // Find dominant symptom by normalised subscore (max varies by # items).
  const items: Record<SasSymptom, number> = {
    loss_of_control: 2,
    disruption: 2,
    preoccupation: 1,
    withdrawal: 2,
    tolerance: 1,
    disregard: 2,
  };
  const normalised: { symptom: SasSymptom; pct: number }[] = (
    Object.entries(bySymptom) as [SasSymptom, number][]
  ).map(([s, score]) => ({ symptom: s, pct: score / (items[s] * 6) }));
  normalised.sort((a, b) => b.pct - a.pct);
  const top = normalised[0]!;
  const family = SYMPTOM_FAMILY[top.symptom];

  if (band === "low") {
    if (family === "calm") return PERSONAS.le_serene;
    if (family === "connection") return PERSONAS.le_connecteur_calme;
    return PERSONAS.le_curieux;
  }
  if (band === "moderate") {
    if (family === "calm") return PERSONAS.le_chercheur;
    if (family === "disruption") return PERSONAS.le_jongleur;
    return PERSONAS.le_curieux_actif;
  }
  // high
  if (family === "control") return PERSONAS.le_capte;
  if (family === "disruption") return PERSONAS.le_disperse;
  return PERSONAS.lhyperconnecte;
}
