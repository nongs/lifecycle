type Props = {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
};

export function SettingsRow({
  label,
  description,
  children,
  last = false,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        last ? "" : "border-b border-line"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
