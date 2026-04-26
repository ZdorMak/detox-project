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
 * Each card declares which **locations** it makes sense in. The picker
 * filters by the player's currently selected location so we never suggest
 * "Sors marcher" while the player is sitting in class.
 *
 * Card text lives in `messages/<locale>.json` under
 * `challenges.cards.<id>.title` and `.body`. This file just defines the
 * deck structure so the engine can pick + persist by stable id.
 */

export type ChallengeCategory =
  | "observation"
  | "social"
  | "movement"
  | "creative"
  | "reflection";

/**
 * Player-declared current context. Covers the 5 places a 10-15 yo French-
 * speaking teen typically spends their day. Defaults to `home`.
 *
 * Coverage rule (enforced by the test below): for every location, every
 * category MUST have at least one card available. This guarantees the
 * picker can always serve a meaningful card without falling back to a
 * mismatched suggestion.
 */
export type Location =
  | "home"
  | "school"
  | "transport"
  | "outside"
  | "with_friends";

export const ALL_LOCATIONS: readonly Location[] = [
  "home",
  "school",
  "transport",
  "outside",
  "with_friends",
] as const;

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
  /** Locations where this card is sensible. Must include at least one. */
  locations: readonly Location[];
}

// Convenience presets — keep the array literals readable.
const ANYWHERE: readonly Location[] = ALL_LOCATIONS;
const INDOOR: readonly Location[] = ["home", "school", "transport", "with_friends"];
const QUIET: readonly Location[] = ["home", "school", "transport"];
const ACTIVE_INDOOR: readonly Location[] = ["home", "school", "with_friends"];
const ACTIVE_OUTDOOR: readonly Location[] = ["home", "outside", "with_friends"];
const PEOPLE_PRESENT: readonly Location[] = ["home", "school", "transport", "outside", "with_friends"];

export const CHALLENGE_CARDS: readonly ChallengeCard[] = [
  // OBSERVATION (10) — looking at the world without a screen
  { id: "window_describe",     category: "observation", durationMin: 2,  difficulty: 1, emoji: "🪟", locations: ["home", "school", "outside"] },
  { id: "five_sounds",         category: "observation", durationMin: 3,  difficulty: 1, emoji: "👂", locations: ANYWHERE },
  { id: "count_colors",        category: "observation", durationMin: 2,  difficulty: 1, emoji: "🎨", locations: ANYWHERE },
  { id: "stranger_outfit",     category: "observation", durationMin: 5,  difficulty: 2, emoji: "👀", locations: ["school", "transport", "outside", "with_friends"] },
  { id: "sky_minute",          category: "observation", durationMin: 1,  difficulty: 1, emoji: "☁️", locations: ["home", "school", "transport", "outside"] },
  { id: "object_history",      category: "observation", durationMin: 5,  difficulty: 2, emoji: "🔎", locations: ANYWHERE },
  { id: "scan_room_details",   category: "observation", durationMin: 3,  difficulty: 1, emoji: "🔬", locations: ANYWHERE },
  { id: "find_yellow_things",  category: "observation", durationMin: 3,  difficulty: 1, emoji: "🟡", locations: ANYWHERE },
  { id: "people_walking_pace", category: "observation", durationMin: 4,  difficulty: 2, emoji: "🚶‍♀️", locations: ["school", "transport", "outside", "with_friends"] },
  { id: "true_sky_color",      category: "observation", durationMin: 2,  difficulty: 2, emoji: "🌈", locations: ["home", "school", "outside"] },

  // SOCIAL (10)
  { id: "ask_day",             category: "social",      durationMin: 3,  difficulty: 1, emoji: "💬", locations: PEOPLE_PRESENT },
  { id: "compliment_someone",  category: "social",      durationMin: 2,  difficulty: 2, emoji: "🌷", locations: PEOPLE_PRESENT },
  { id: "phone_call_friend",   category: "social",      durationMin: 10, difficulty: 2, emoji: "☎️", locations: ["home", "outside"] },
  { id: "thank_someone",       category: "social",      durationMin: 2,  difficulty: 1, emoji: "🙏", locations: PEOPLE_PRESENT },
  { id: "ask_advice",          category: "social",      durationMin: 5,  difficulty: 2, emoji: "🤝", locations: ["home", "school", "with_friends"] },
  { id: "share_meal_no_phone", category: "social",      durationMin: 15, difficulty: 3, emoji: "🍽️", locations: ["home", "with_friends"] },
  { id: "smile_at_stranger",   category: "social",      durationMin: 1,  difficulty: 1, emoji: "🙂", locations: ["school", "transport", "outside", "with_friends"] },
  { id: "ask_favorite_song",   category: "social",      durationMin: 3,  difficulty: 1, emoji: "🎶", locations: PEOPLE_PRESENT },
  { id: "handwritten_note",    category: "social",      durationMin: 5,  difficulty: 2, emoji: "✉️", locations: ["home", "school", "with_friends"] },
  { id: "off_topic_question",  category: "social",      durationMin: 3,  difficulty: 2, emoji: "🤔", locations: ["home", "school", "with_friends"] },

  // MOVEMENT (10)
  { id: "ten_squats",          category: "movement",    durationMin: 1,  difficulty: 1, emoji: "🏋️", locations: ACTIVE_INDOOR.concat(["outside"]) },
  { id: "stretch_one_minute",  category: "movement",    durationMin: 1,  difficulty: 1, emoji: "🤸", locations: ANYWHERE },
  { id: "walk_around_block",   category: "movement",    durationMin: 10, difficulty: 2, emoji: "🚶", locations: ["outside"] },
  { id: "stairs_three_times",  category: "movement",    durationMin: 3,  difficulty: 2, emoji: "🪜", locations: ["home", "school", "outside"] },
  { id: "dance_one_song",      category: "movement",    durationMin: 4,  difficulty: 2, emoji: "💃", locations: ["home", "with_friends"] },
  { id: "barefoot_outside",    category: "movement",    durationMin: 5,  difficulty: 3, emoji: "🦶", locations: ["outside"] },
  { id: "shoulder_rolls",      category: "movement",    durationMin: 1,  difficulty: 1, emoji: "💪", locations: ANYWHERE },
  { id: "jumping_jacks_20",    category: "movement",    durationMin: 2,  difficulty: 2, emoji: "🤾", locations: ["home", "outside", "with_friends"] },
  { id: "balance_one_leg",     category: "movement",    durationMin: 1,  difficulty: 1, emoji: "🦩", locations: ANYWHERE },
  { id: "non_dominant_hand",   category: "movement",    durationMin: 3,  difficulty: 2, emoji: "✋", locations: ANYWHERE },

  // CREATIVE (10)
  { id: "draw_what_you_see",   category: "creative",    durationMin: 5,  difficulty: 1, emoji: "✏️", locations: ANYWHERE },
  { id: "write_haiku",         category: "creative",    durationMin: 5,  difficulty: 2, emoji: "📝", locations: ANYWHERE },
  { id: "fold_paper_thing",    category: "creative",    durationMin: 5,  difficulty: 2, emoji: "📄", locations: ["home", "school", "with_friends"] },
  { id: "rearrange_desk",      category: "creative",    durationMin: 10, difficulty: 1, emoji: "🗂️", locations: ["home", "school"] },
  { id: "letter_to_future_me", category: "creative",    durationMin: 10, difficulty: 3, emoji: "💌", locations: ["home", "school", "outside"] },
  { id: "humming_a_tune",      category: "creative",    durationMin: 2,  difficulty: 1, emoji: "🎵", locations: ANYWHERE },
  { id: "invent_a_story",      category: "creative",    durationMin: 5,  difficulty: 2, emoji: "📖", locations: ANYWHERE },
  { id: "paper_airplane",      category: "creative",    durationMin: 4,  difficulty: 2, emoji: "🛩️", locations: ["home", "school", "with_friends"] },
  { id: "song_for_today",      category: "creative",    durationMin: 3,  difficulty: 1, emoji: "🎤", locations: ANYWHERE },
  { id: "five_words_now",      category: "creative",    durationMin: 3,  difficulty: 1, emoji: "📚", locations: ANYWHERE },

  // REFLECTION (10)
  { id: "eyes_closed_minute",  category: "reflection",  durationMin: 1,  difficulty: 1, emoji: "🧘", locations: ANYWHERE },
  { id: "three_good_things",   category: "reflection",  durationMin: 3,  difficulty: 1, emoji: "✨", locations: ANYWHERE },
  { id: "breathing_4_7_8",     category: "reflection",  durationMin: 3,  difficulty: 2, emoji: "🌬️", locations: ANYWHERE },
  { id: "imagine_summer",      category: "reflection",  durationMin: 2,  difficulty: 1, emoji: "🏖️", locations: ANYWHERE },
  { id: "what_will_matter",    category: "reflection",  durationMin: 5,  difficulty: 3, emoji: "⏳", locations: ANYWHERE },
  { id: "drink_water_slowly",  category: "reflection",  durationMin: 2,  difficulty: 1, emoji: "💧", locations: ANYWHERE },
  { id: "notice_one_feeling",  category: "reflection",  durationMin: 2,  difficulty: 1, emoji: "💗", locations: ANYWHERE },
  { id: "gratitude_one_person",category: "reflection",  durationMin: 3,  difficulty: 1, emoji: "🌟", locations: ANYWHERE },
  { id: "silver_lining",       category: "reflection",  durationMin: 4,  difficulty: 2, emoji: "🌤️", locations: ANYWHERE },
  { id: "silence_60_sec",      category: "reflection",  durationMin: 1,  difficulty: 1, emoji: "🤫", locations: ANYWHERE },
] as const;

const CARDS_BY_ID = new Map(CHALLENGE_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): ChallengeCard | undefined {
  return CARDS_BY_ID.get(id);
}

export const TOTAL_CARDS = CHALLENGE_CARDS.length;

/**
 * Returns cards available at this location, optionally filtered by category.
 */
export function cardsForLocation(
  location: Location,
  category?: ChallengeCategory,
): ChallengeCard[] {
  return CHALLENGE_CARDS.filter(
    (c) =>
      c.locations.includes(location) &&
      (category === undefined || c.category === category),
  );
}

/**
 * Self-check: at every location, every category must have ≥1 card.
 * Throws at module load (i.e. at import time on the server) if the deck
 * ever drifts. This catches missing tags before they become user-visible.
 */
function validateCoverage(): void {
  const categories: ChallengeCategory[] = [
    "observation",
    "social",
    "movement",
    "creative",
    "reflection",
  ];
  for (const loc of ALL_LOCATIONS) {
    for (const cat of categories) {
      const n = cardsForLocation(loc, cat).length;
      if (n === 0) {
        throw new Error(
          `[challenges/cards] coverage gap: location="${loc}" category="${cat}" has 0 cards`,
        );
      }
    }
  }
}

validateCoverage();
