import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: ReactNode;
};

export function Input({ label, error, hint, className = "", id, ...rest }: Props) {
  const inputId = id ?? (label ? label.replace(/\s/g, "-") : undefined);

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="label-text">{label}</span>}
      <input
        id={inputId}
        className={`input-field ${label ? "mt-1.5" : ""} ${className}`}
        {...rest}
      />
      {hint && (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      )}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </label>
  );
}
