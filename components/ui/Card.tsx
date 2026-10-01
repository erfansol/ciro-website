import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Kept for callsite compatibility — flat cards have no glow. */
  glow?: boolean;
};

// `glow` is destructured purely to keep it out of `rest`, so it never
// reaches the DOM node as an unknown attribute.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Card({ className, glow: _glow, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-ink-900/10 bg-white transition-colors duration-200",
        "hover:border-ink-900/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25",
        className,
      )}
      {...rest}
    />
  );
}
