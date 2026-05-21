import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm disabled:opacity-50",
  secondary:
    "border border-line-strong bg-surface text-ink-muted hover:bg-accent-soft disabled:opacity-50",
  ghost:
    "text-ink-muted hover:bg-accent-soft disabled:opacity-50",
  destructive:
    "bg-danger text-white hover:bg-danger-hover disabled:opacity-50",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
