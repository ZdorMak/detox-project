/**
 * Interactive experience configuration — typed scene graph.
 *
 * Each scene is either:
 *   - "narration": plays a sequence of typed-out lines, then auto-advances
 *     to `nextSceneId` (or to a terminal `end` action).
 *   - "choice": pauses on a prompt with N options, each pointing to a
 *     follow-up scene id.
 *
 * Scene IDs match the storyboard in docs/video/storyboard.md.
 *
 * Branching contract for analytics:
 *   - Every scene entry fires `event_type: "scene_enter"`.
 *   - Every scene completion fires `event_type: "scene_complete"`.
 *   - Every choice fires `event_type: "branch_choice"` with
 *     `metadata: { point, choice }`.
 *   - Reaching the closing card fires `event_type: "experience_complete"`.
 */

export type SceneAction =
  | { kind: "next"; sceneId: string }
  | { kind: "end"; cta: "to_survey" };

export interface NarrationScene {
  id: string;
  type: "narration";
  /** i18n key under `experience.scenes.<id>.lines.<n>`. Number of lines = items.length. */
  lines: number;
  /** Lottie animation file under public/animations/<file>. Optional. */
  lottie?: string;
  /** Approximate duration per line, ms. Tuned for ~3 words/second in FR. */
  msPerLine?: number;
  /** What happens after the last line auto-completes. */
  next: SceneAction;
}

export interface ChoiceOption {
  id: "A" | "B";
  /** i18n key under `experience.scenes.<id>.options.<id>`. */
  next: SceneAction;
}

export interface ChoiceScene {
  id: string;
  type: "choice";
  /** Optional decorative Lottie. */
  lottie?: string;
  /** Telemetry tag for the branch_choice event. */
  branchPoint: 1 | 2;
  options: [ChoiceOption, ChoiceOption];
}

export type Scene = NarrationScene | ChoiceScene;

export const FIRST_SCENE_ID = "evening_room";

export const SCENES: Readonly<Record<string, Scene>> = {
  evening_room: {
    id: "evening_room",
    type: "narration",
    lines: 4,
    lottie: "evening_room.lottie",
    msPerLine: 3200,
    next: { kind: "next", sceneId: "choice_1" },
  },
  choice_1: {
    id: "choice_1",
    type: "choice",
    branchPoint: 1,
    options: [
      { id: "A", next: { kind: "next", sceneId: "rabbit_hole" } },
      { id: "B", next: { kind: "next", sceneId: "silence" } },
    ],
  },
  rabbit_hole: {
    id: "rabbit_hole",
    type: "narration",
    lines: 4,
    lottie: "rabbit_hole.lottie",
    msPerLine: 3500,
    next: { kind: "next", sceneId: "choice_2" },
  },
  silence: {
    id: "silence",
    type: "narration",
    lines: 4,
    lottie: "silence.lottie",
    msPerLine: 3500,
    next: { kind: "next", sceneId: "choice_2" },
  },
  choice_2: {
    id: "choice_2",
    type: "choice",
    branchPoint: 2,
    options: [
      { id: "A", next: { kind: "next", sceneId: "shared_screen" } },
      { id: "B", next: { kind: "next", sceneId: "listening" } },
    ],
  },
  shared_screen: {
    id: "shared_screen",
    type: "narration",
    lines: 4,
    lottie: "shared_screen.lottie",
    msPerLine: 3500,
    next: { kind: "next", sceneId: "closing" },
  },
  listening: {
    id: "listening",
    type: "narration",
    lines: 4,
    lottie: "listening.lottie",
    msPerLine: 3500,
    next: { kind: "next", sceneId: "closing" },
  },
  closing: {
    id: "closing",
    type: "narration",
    lines: 3,
    msPerLine: 3500,
    next: { kind: "end", cta: "to_survey" },
  },
};

/** Total number of distinct branches (used by progress estimation). */
export const SCENES_PER_RUN = 5; // evening_room → choice_1 → 3a OR 3b → choice_2 → 5a OR 5b → closing

/** Convenience for assertion-style lookups. */
export function getScene(id: string): Scene {
  const scene = SCENES[id];
  if (!scene) throw new Error(`Unknown scene id: ${id}`);
  return scene;
}
