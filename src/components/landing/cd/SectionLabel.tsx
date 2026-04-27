interface SectionLabelProps {
  num: string;
  label: string;
}

/** "01 ─── label" — repeating motif in every Claude Design section. */
export function SectionLabel({ num, label }: SectionLabelProps) {
  return (
    <div
      className="mb-7 flex items-center gap-3.5"
      style={{ color: "var(--fg-3)" }}
    >
      <span className="cd-mono">{num}</span>
      <span className="h-px flex-[0_0_80px]" style={{ background: "var(--line-2)" }} />
      <span className="cd-mono">{label}</span>
    </div>
  );
}
