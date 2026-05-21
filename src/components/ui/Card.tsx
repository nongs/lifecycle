import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "muted" | "dashed";

const variantClass: Record<Variant, string> = {
  default: "card",
  muted: "card-muted",
  dashed: "card-dashed",
};

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
};

export function Card({
  children,
  variant = "default",
  className = "",
  ...rest
}: Props) {
  return (
    <div className={`${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
