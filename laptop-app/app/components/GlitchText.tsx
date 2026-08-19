import type { ElementType } from "react";

/**
 * Text with cyan/red ghost copies behind it. The ghosts are drawn from
 * `data-text` by CSS pseudo-elements, so the string has to be plain text.
 *
 * mode:
 *  - "idle"  — glitches on its own clock (headers, the wordmark)
 *  - "hover" — ghosts run continuously but stay hidden until the enclosing
 *              .corp-tile is hovered, so each hover lands mid-cycle
 */
export default function GlitchText({
  text,
  as: Tag = "span",
  mode = "idle",
  speed,
  className = "",
}: {
  text: string;
  as?: ElementType;
  mode?: "idle" | "hover";
  speed?: 1 | 2 | 3;
  className?: string;
}) {
  const modeClass = mode === "idle" ? "gx-idle" : "gx-hover";
  const speedClass = speed === 1 ? "gx-t1" : speed === 3 ? "gx-t3" : "";

  return (
    <Tag data-text={text} className={`gx ${modeClass} ${speedClass} ${className}`}>
      {text}
    </Tag>
  );
}
