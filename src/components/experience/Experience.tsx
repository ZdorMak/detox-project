"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  FIRST_SCENE_ID,
  SCENES_PER_RUN,
  getScene,
  type Scene,
  type ChoiceScene,
  type NarrationScene,
} from "@/lib/experience/scenes";
import {
  flushNow,
  registerUnloadFlush,
  trackEvent,
} from "@/lib/experience/telemetry";
import { TypedLines } from "./TypedLines";
import { SceneVisual } from "./SceneVisual";
import { Button } from "@/components/ui/button";

interface ExperienceProps {
  surveyHref: string;
}

/**
 * Top-level engine for the interactive experience (W3-3).
 * Keeps the active scene id + path traversed in local state, drives
 * narration / choice rendering, and ships every meaningful action through
 * the telemetry helper to /api/video/event.
 */
export function Experience({ surveyHref }: ExperienceProps) {
  const router = useRouter();
  const t = useTranslations("experience");
  const reduceMotion = usePrefersReducedMotion();

  const [sceneId, setSceneId] = useState<string>(FIRST_SCENE_ID);
  const [path, setPath] = useState<string[]>([FIRST_SCENE_ID]);
  const [done, setDone] = useState(false);

  const scene = getScene(sceneId);

  // Telemetry: scene_enter + ensure pending events are flushed on unload.
  useEffect(() => {
    trackEvent({ event_type: "scene_enter", metadata: { scene: sceneId } });
    return registerUnloadFlush();
  }, [sceneId]);

  const advance = useCallback(
    (next: Scene["id"]) => {
      trackEvent({ event_type: "scene_complete", metadata: { scene: sceneId } });
      setPath((p) => [...p, next]);
      setSceneId(next);
    },
    [sceneId],
  );

  const handleNarrationComplete = useCallback(
    (narration: NarrationScene) => {
      if (narration.next.kind === "end") {
        trackEvent({
          event_type: "experience_complete",
          metadata: { path },
        });
        setDone(true);
      } else {
        advance(narration.next.sceneId);
      }
    },
    [advance, path],
  );

  const handleChoice = useCallback(
    (choiceScene: ChoiceScene, optionId: "A" | "B") => {
      trackEvent({
        event_type: "branch_choice",
        metadata: { point: choiceScene.branchPoint, choice: optionId },
      });
      const opt = choiceScene.options.find((o) => o.id === optionId);
      if (!opt) return;
      if (opt.next.kind === "end") {
        setDone(true);
      } else {
        advance(opt.next.sceneId);
      }
    },
    [advance],
  );

  const goToSurvey = useCallback(async () => {
    trackEvent({ event_type: "experience_cta", metadata: { cta: "to_survey" } });
    await flushNow();
    router.push(surveyHref);
  }, [router, surveyHref]);

  // Keyboard support on choice screens: 1 / 2 select option A / B.
  useEffect(() => {
    if (scene.type !== "choice") return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "1") {
        e.preventDefault();
        handleChoice(scene, "A");
      } else if (e.key === "2") {
        e.preventDefault();
        handleChoice(scene, "B");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scene, handleChoice]);

  const progressPct = useMemo(
    () => Math.min(100, Math.round((path.length / SCENES_PER_RUN) * 100)),
    [path.length],
  );

  return (
    <main id="main" className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("header.label")}
          </span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("a11y.progressLabel")}
          >
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              trackEvent({ event_type: "experience_skip" });
              void flushNow().then(() => router.push(surveyHref));
            }}
          >
            {t("nav.skip")}
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={done ? "done" : sceneId}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
          >
            {done ? (
              <ClosingCard
                title={t("closing.title")}
                body={t("closing.body")}
                cta={t("closing.cta")}
                onCta={() => void goToSurvey()}
              />
            ) : scene.type === "narration" ? (
              <NarrationView
                scene={scene}
                t={t}
                reduceMotion={reduceMotion}
                onComplete={() => handleNarrationComplete(scene)}
              />
            ) : (
              <ChoiceView
                scene={scene}
                t={t}
                reduceMotion={reduceMotion}
                onChoose={(opt) => handleChoice(scene, opt)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

interface NarrationViewProps {
  scene: NarrationScene;
  t: ReturnType<typeof useTranslations>;
  reduceMotion: boolean;
  onComplete: () => void;
}

function NarrationView({
  scene,
  t,
  reduceMotion,
  onComplete,
}: NarrationViewProps) {
  const lines = useMemo(
    () =>
      Array.from({ length: scene.lines }, (_, i) =>
        t(`scenes.${scene.id}.lines.${i + 1}` as const),
      ),
    [scene.id, scene.lines, t],
  );
  return (
    <div className="space-y-6">
      <SceneVisual
        lottieFile={scene.lottie}
        sceneId={scene.id}
        reduceMotion={reduceMotion}
      />
      <TypedLines
        lines={lines}
        msPerLine={scene.msPerLine ?? 3500}
        reduceMotion={reduceMotion}
        onComplete={onComplete}
      />
    </div>
  );
}

interface ChoiceViewProps {
  scene: ChoiceScene;
  t: ReturnType<typeof useTranslations>;
  reduceMotion: boolean;
  onChoose: (opt: "A" | "B") => void;
}

function ChoiceView({ scene, t, reduceMotion, onChoose }: ChoiceViewProps) {
  return (
    <div className="space-y-6">
      <SceneVisual
        lottieFile={scene.lottie}
        sceneId={scene.id}
        reduceMotion={reduceMotion}
      />
      <h2 className="text-balance text-center text-2xl font-semibold leading-tight sm:text-3xl">
        {t(`scenes.${scene.id}.prompt` as const)}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {scene.options.map((opt, idx) => (
          <Button
            key={opt.id}
            type="button"
            size="lg"
            variant={idx === 0 ? "default" : "outline"}
            className="h-auto min-h-[4rem] whitespace-normal py-3 text-left text-base leading-snug"
            onClick={() => onChoose(opt.id)}
          >
            <span className="mr-2 text-xs opacity-70">{idx + 1}.</span>
            {t(`scenes.${scene.id}.options.${opt.id}` as const)}
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {t("nav.keyboardHint")}
      </p>
    </div>
  );
}

interface ClosingCardProps {
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}

function ClosingCard({ title, body, cta, onCta }: ClosingCardProps) {
  return (
    <div className="space-y-6 text-center">
      <SceneVisual sceneId="closing" reduceMotion={false} />
      <h2 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h2>
      <p className="text-balance text-lg text-muted-foreground">{body}</p>
      <Button size="lg" onClick={onCta} autoFocus>
        {cta} →
      </Button>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}
