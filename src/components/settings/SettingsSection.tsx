type Props = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: Props) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {children}
      </div>
    </section>
  );
}
