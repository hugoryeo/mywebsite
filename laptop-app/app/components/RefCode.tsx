/**
 * The short reference code, styled as a tag so it reads as an identifier
 * rather than as part of the laptop's name.
 */
export default function RefCode({
  code,
  size = "sm",
}: {
  code: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center border border-corp-accent-dim bg-corp-900 font-display font-bold tracking-[0.1em] whitespace-nowrap text-corp-accent-bright tabular-nums ${
        size === "lg" ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]"
      }`}
      title="Reference code"
    >
      {code}
    </span>
  );
}
