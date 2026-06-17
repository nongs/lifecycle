type Tab = "spend" | "activity";

type Props = {
  value: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "spend", label: "비용" },
  { id: "activity", label: "활동" },
];

export function StatsViewTabs({ value, onChange }: Props) {
  return (
    <div
      className="mb-6 flex rounded-xl border border-line bg-surface-muted p-1"
      role="tablist"
      aria-label="통계 보기"
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export type StatsViewTab = Tab;
