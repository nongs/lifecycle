type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: "tab";
  "aria-selected"?: boolean;
};

export function Chip({
  active,
  onClick,
  children,
  role,
  "aria-selected": ariaSelected,
}: Props) {
  return (
    <button
      type="button"
      role={role}
      aria-selected={ariaSelected}
      onClick={onClick}
      className={`chip ${active ? "chip-active" : "chip-inactive"}`}
    >
      {children}
    </button>
  );
}
