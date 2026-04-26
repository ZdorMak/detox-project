/**
 * "Pose le téléphone" — challenge card deck.
 *
 * Each card is a small real-world action. The point of the game is for the
 * player to *put down the phone* and do the thing, not to consume more
 * screen time. Cards are intentionally:
 *   - SHORT (most under 5 minutes, none over 15)
 *   - LOW-FRICTION (doable indoors, no equipment, no money, alone or with one person)
 *   - NON-PRESCRIPTIVE (no "you should" — invitations, not instructions)
 *   - SAFE for school-age users (5e–9e Harmos, 10–15 ans)
 *
 * The card text itself lives in `messages/<locale>.json` under
 * `challenges.cards.<id>.title` and `.body`. This file just defines the
 * deck structure so the game engine can pick + persist by stable id.
 */

export type ChallengeCategory =
  | "observation"
  | "social"
  | "movement"
  | "creative"
  | "reflection";

export interface ChallengeCard {
  /** Stable id used in DB + i18n keys. snake_case, never reused. */
  id: string;
  category: ChallengeCategory;
  /** Suggested duration in minutes — UI shows it; nothing enforces it (honor system). */
  durationMin: number;
  /** Difficulty 1..3 — used for deck progression (easier cards drawn first). */
  difficulty: 1 | 2 | 3;
  /** Optional emoji shown on the card face. */
  emoji: string;
}

export const CHALLENGE_CARDS: readonly ChallengeCard[] = [
  // OBSERVATION (6) — looking at the world without a screen
  { id: "window_describe",     category: "observation", durationMin: 2,  difficulty: 1, emoji: "🪟" },
  { id: "five_sounds",         category: "observation", durationMin: 3,  difficulty: 1, emoji: "👂" },
  { id: "count_colors",        category: "observation", durationMin: 2,  difficulty: 1, emoji: "🎨" },
  { id: "stranger_outfit",     category: "observation", durationMin: 5,  difficulty: 2, emoji: "👀" },
  { id: "sky_minute",          category: "observation", durationMin: 1,  difficulty: 1, emoji: "☁️" },
  { id: "object_history",      category: "observation", durationMin: 5,  difficulty: 2, emoji: "🔎" },

  // SOCIAL (6) — talking to a real person
  { id: "ask_day",             category: "social",      durationMin: 3,  difficulty: 1, emoji: "💬" },
  { id: "compliment_someone",  category: "social",      durationMin: 2,  difficulty: 2, emoji: "🌷" },
  { id: "phone_call_friend",   category: "social",      durationMin: 10, difficulty: 2, emoji: "☎️" },
  { id: "thank_someone",       category: "social",      durationMin: 2,  difficulty: 1, emoji: "🙏" },
  { id: "ask_advice",          category: "social",      durationMin: 5,  difficulty: 2, emoji: "🤝" },
  { id: "share_meal_no_phone", category: "social",      durationMin: 15, difficulty: 3, emoji: "🍽️" },

  // MOVEMENT (6) — body in motion
  { id: "ten_squats",          category: "movement",    durationMin: 1,  difficulty: 1, emoji: "🏋️" },
  { id: "stretch_one_minute",  category: "movement",    durationMin: 1,  difficulty: 1, emoji: "🤸" },
  { id: "walk_around_block",   category: "movement",    durationMin: 10, difficulty: 2, emoji: "🚶" },
  { id: "stairs_three_times",  category: "movement",    durationMin: 3,  difficulty: 2, emoji: "🪜" },
  { id: "dance_one_song",      category: "movement",    durationMin: 4,  difficulty: 2, emoji: "💃" },
  { id: "barefoot_outside",    category: "movement",    durationMin: 5,  difficulty: 3, emoji: "🦶" },

  // CREATIVE (6) — make something
  { id: "draw_what_you_see",   category: "creative",    durationMin: 5,  difficulty: 1, emoji: "✏️" },
  { id: "write_haiku",         category: "creative",    durationMin: 5,  difficulty: 2, emoji: "📝" },
  { id: "fold_paper_thing",    category: "creative",    durationMin: 5,  difficulty: 2, emoji: "📄" },
  { id: "rearrange_desk",      category: "creative",    durationMin: 10, difficulty: 1, emoji: "🗂️" },
  { id: "letter_to_future_me", category: "creative",    durationMin: 10, difficulty: 3, emoji: "💌" },
  { id: "humming_a_tune",      category: "creative",    durationMin: 2,  difficulty: 1, emoji: "🎵" },

  // REFLECTION (6) — pause and notice
  { id: "eyes_closed_minute",  category: "reflection",  durationMin: 1,  difficulty: 1, emoji: "🧘" },
  { id: "three_good_things",   category: "reflection",  durationMin: 3,  difficulty: 1, emoji: "✨" },
  { id: "breathing_4_7_8",     category: "reflection",  durationMin: 3,  difficulty: 2, emoji: "🌬️" },
  { id: "imagine_summer",      category: "reflection",  durationMin: 2,  difficulty: 1, emoji: "🏖️" },
  { id: "what_will_matter",    category: "reflection",  durationMin: 5,  difficulty: 3, emoji: "⏳" },
  { id: "drink_water_slowly",  category: "reflection",  durationMin: 2,  difficulty: 1, emoji: "💧" },
] as const;

/** Quick lookup by id, e.g. when reading attempt rows back. */
const CARDS_BY_ID = new Map(CHALLENGE_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): ChallengeCard | undefined {
  return CARDS_BY_ID.get(id);
}

export const TOTAL_CARDS = CHALLENGE_CARDS.length;
