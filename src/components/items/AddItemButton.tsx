import { Button } from "@/components/ui/Button";

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
  return (
    <Button
      variant={variant === "primary" ? "primary" : "secondary"}
      className={`shrink-0 px-3 py-2 ${className}`}
      onClick={onClick}
    >
      + 항목 추가
    </Button>
  );
}
