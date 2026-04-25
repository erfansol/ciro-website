import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-400 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight text-ink-900 dark:text-white text-balance leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base sm:text-lg text-ink-900/70 dark:text-white/70 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
