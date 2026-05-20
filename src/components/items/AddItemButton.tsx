type Props = {
  onClick: () => void;
  variant?: "primary" | "outline";
  className?: string;
};

export function AddItemButton({
  onClick,
  variant = "primary",
  className = "",
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${styles} ${className}`}
    >
      + 항목 추가
    </button>
  );
}
