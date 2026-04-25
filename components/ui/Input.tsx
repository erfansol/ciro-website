import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-2xl border border-ink-900/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-900/40 dark:placeholder:text-white/40 backdrop-blur focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-900/70 dark:text-white/60">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(fieldBase, error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30", className)}
          {...rest}
        />
        {error ? (
          <span className="mt-1.5 block text-xs text-rose-500" role="alert">{error}</span>
        ) : hint ? (
          <span className="mt-1.5 block text-xs text-ink-900/50 dark:text-white/40">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = "Input";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    return (
      <label htmlFor={selectId} className="block">
        {label && (
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-900/70 dark:text-white/60">
            {label}
          </span>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(fieldBase, "appearance-none pr-10", error && "border-rose-500", className)}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <span className="mt-1.5 block text-xs text-rose-500" role="alert">{error}</span>}
      </label>
    );
  },
);
Select.displayName = "Select";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const taId = id ?? rest.name;
    return (
      <label htmlFor={taId} className="block">
        {label && (
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-900/70 dark:text-white/60">
            {label}
          </span>
        )}
        <textarea
          ref={ref}
          id={taId}
          aria-invalid={Boolean(error)}
          className={cn(fieldBase, "min-h-28 resize-y", error && "border-rose-500", className)}
          {...rest}
        />
        {error && <span className="mt-1.5 block text-xs text-rose-500" role="alert">{error}</span>}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";
