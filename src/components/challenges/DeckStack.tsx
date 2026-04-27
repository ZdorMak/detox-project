"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ChallengeCard as CardType } from "@/lib/challenges/cards";

interface DeckStackProps {
  /** Top card (currently in front, drag-to-decide). */
  topCard: CardType;
  /** Optional next card peeking out underneath. */
  nextCard?: CardType | null;
  /** Optional 3rd card for visual depth. */
  next2Card?: CardType | null;
  onCompleted: () => void;
  onSkipped: () => void;
  /** Visual labels for the drag stamps ("I'll do it" / "Skip"). */
  stampDoLabel: string;
  stampSkipLabel: string;
}

/**
 * Tarot-style draggable card deck — direct port of Claude Design's `.deck`.
 *
 * - 3 cards stacked with offset+scale: top is interactive, next/next2 peek
 *   behind for visual depth.
 * - Drag horizontally: rotation follows displacement, opacity fades out
 *   past 110px. Beyond ±110px on release, the card "exits" and resolves
 *   as completed (right) or skipped (left).
 * - Stamps "I'LL DO IT" / "SKIP" fade in based on drag direction.
 * - Pointer events used so it works on mouse, touch and stylus alike.
 */
export function DeckStack({
  topCard,
  nextCard,
  next2Card,
  onCompleted,
  onSkipped,
  stampDoLabel,
  stampSkipLabel,
}: DeckStackProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [exiting, setExiting] = useState<{ dir: 1 | -1 } | null>(null);
  const startRef = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, dragging: true });
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.dragging) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
      dragging: true,
    });
  }
  function onPointerUp() {
    if (!drag.dragging) return;
    const off = drag.x;
    if (Math.abs(off) > 110) {
      const dir = (off > 0 ? 1 : -1) as 1 | -1;
      setExiting({ dir });
      setTimeout(() => {
        if (dir === 1) onCompleted();
        else onSkipped();
        setDrag({ x: 0, y: 0, dragging: false });
        setExiting(null);
      }, 320);
    } else {
      setDrag({ x: 0, y: 0, dragging: false });
    }
  }

  const tx = exiting ? exiting.dir * 600 : drag.x;
  const ty = exiting ? -100 : drag.y;
  const rot = tx / 20;
  const opacity = exiting ? 0 : 1 - Math.min(Math.abs(drag.x) / 400, 0.3);

  const dragRatio = drag.x / 110;
  const showYes = dragRatio > 0.3;
  const showNo = dragRatio < -0.3;

  return (
    <div className="deck">
      {next2Card && <BackCard card={next2Card} depth={2} />}
      {nextCard && <BackCard card={nextCard} depth={1} />}
      <div
        className="card-shell card-top"
        style={{
          transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
          opacity,
          transition: drag.dragging ? "none" : "transform .32s cubic-bezier(.2,.8,.2,1), opacity .32s",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <CardArt card={topCard} />
        <span className={`card-stamp card-stamp-yes ${showYes ? "on" : ""}`}>
          {stampDoLabel}
        </span>
        <span className={`card-stamp card-stamp-no ${showNo ? "on" : ""}`}>
          {stampSkipLabel}
        </span>
      </div>
    </div>
  );
}

function BackCard({ card, depth }: { card: CardType; depth: 1 | 2 }) {
  return (
    <div
      className="card-shell card-stack"
      style={{
        transform: `translate(${depth * 8}px, ${depth * 10}px) scale(${1 - depth * 0.04})`,
        opacity: 1 - depth * 0.3,
        zIndex: 5 - depth,
      }}
      aria-hidden="true"
    >
      <CardArt card={card} />
    </div>
  );
}

/** Inner art of a card — Tarot-style face with category tint, corner
 *  ornaments, italic title, level pips, etc. Mirrors `card-inner` from
 *  the Claude Design CSS. */
function CardArt({ card }: { card: CardType }) {
  const t = useTranslations("challenges");
  const tint = categoryTint(card.category);
  const level = levelDots(card.difficulty);
  return (
    <div className="card-inner" data-cat={tint}>
      <div className="card-pattern" aria-hidden="true" />

      <div className="card-corner card-corner-tl">
        <span className="card-corner-n">{shortId(card.id)}</span>
        <span className="card-corner-s">{card.emoji}</span>
      </div>
      <div className="card-corner card-corner-br">
        <span className="card-corner-s">{card.emoji}</span>
        <span className="card-corner-n">{shortId(card.id)}</span>
      </div>

      <div className="card-head">
        <span className="cd-dim">DETOX · {t(`categories.${card.category}` as const)}</span>
        <span className="card-level">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < level ? "lvl-on" : "lvl-off"}>
              ●
            </span>
          ))}
        </span>
      </div>

      <div className="card-body">
        <div className="card-symbol" aria-hidden="true">
          {card.emoji}
        </div>
        <h3 className="card-title">
          {t(`cards.${card.id}.title` as const)}
        </h3>
        <div className="card-rule" />
        <p className="card-d">{t(`cards.${card.id}.body` as const)}</p>
      </div>

      <div className="card-foot">
        <span className="cd-dim">
          {t("cardLevel", { level })} · {t("cardMeta.duration", { min: card.durationMin })}
        </span>
        <span className="card-mark">↗ {t("cardTry")}</span>
      </div>
    </div>
  );
}

function categoryTint(cat: CardType["category"]): "senses" | "body" | "social" | "space" | "time" {
  switch (cat) {
    case "observation": return "senses";
    case "social": return "social";
    case "movement": return "body";
    case "creative": return "space";
    case "reflection": return "time";
  }
}

function levelDots(difficulty: 1 | 2 | 3): number {
  return [1, 3, 5][difficulty - 1] ?? 3;
}

function shortId(id: string): string {
  // Initials of the snake_case id, max 3 chars: "share_meal_no_phone" → "SMN".
  return id
    .split("_")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}
