/**
 * Programs — thematic ordered tracks of cards.
 *
 * Each program is a simple array of card_ids the player goes through
 * sequentially. Progress is per-(session, program) in `program_progress`.
 *
 * Cards in programs are NOT removed from the regular `/jeu` deck — a player
 * can do "Bouge ton corps" as a structured 7-day track AND continue casual
 * play in parallel. They share the same underlying card pool.
 */

import { CHALLENGE_CARDS, getCard } from "./cards";

export interface ProgramDef {
  id: string;
  emoji: string;
  /** i18n key under `challenges.programs.<id>.title` and `.description`. */
  cardIds: readonly string[];
}

export const PROGRAMS: readonly ProgramDef[] = [
  {
    id: "matin_sans_ecran",
    emoji: "🌅",
    cardIds: [
      "stretch_one_minute",
      "drink_water_slowly",
      "three_good_things",
      "sky_minute",
      "shoulder_rolls",
    ],
  },
  {
    id: "connexions",
    emoji: "🤝",
    cardIds: [
      "smile_at_stranger",
      "ask_day",
      "thank_someone",
      "compliment_someone",
      "phone_call_friend",
      "ask_advice",
      "share_meal_no_phone",
      "invent_a_story",
      "scan_room_details",
      "what_will_matter",
    ],
  },
  {
    id: "bouge_ton_corps",
    emoji: "🏃",
    cardIds: [
      "shoulder_rolls",
      "stretch_one_minute",
      "ten_squats",
      "stairs_three_times",
      "dance_one_song",
      "walk_around_block",
      "barefoot_outside",
    ],
  },
  {
    id: "sept_jours_calme",
    emoji: "🧘",
    cardIds: [
      "eyes_closed_minute",
      "breathing_4_7_8",
      "three_good_things",
      "imagine_summer",
      "notice_one_feeling",
      "what_will_matter",
      "drink_water_slowly",
    ],
  },
] as const;

const PROGRAMS_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));
export function getProgram(id: string): ProgramDef | undefined {
  return PROGRAMS_BY_ID.get(id);
}

/**
 * Self-check: every card_id referenced by a program must exist in the deck.
 * Throws at module load if it ever drifts.
 */
function validateProgramReferences(): void {
  for (const p of PROGRAMS) {
    for (const id of p.cardIds) {
      if (!getCard(id)) {
        throw new Error(`[challenges/programs] program "${p.id}" references unknown card_id "${id}"`);
      }
    }
  }
}
validateProgramReferences();

// Re-export for convenience.
export { CHALLENGE_CARDS };
