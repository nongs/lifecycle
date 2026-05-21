import type { ReactNode } from "react";

type IllustrationVariant = "list" | "cost";

function IllustrationWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 text-line-strong" aria-hidden>
      {children}
    </div>
  );
}

export function EmptyIllustration() {
  return (
    <IllustrationWrap>
      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="20"
          y="16"
          width="80"
          height="56"
          rx="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path
          d="M40 44h40M40 56h28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="88" cy="72" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M95 79l8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IllustrationWrap>
  );
}

/** 비용·지출 empty 전용 (영수증 + 동전) */
export function CostEmptyIllustration() {
  return (
    <IllustrationWrap>
      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 22h44l8 12v48H32V22z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M44 22v-6h20v6M40 38h32M40 50h24M40 62h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="78" cy="72" r="16" stroke="currentColor" strokeWidth="2" />
        <path
          d="M78 64v16M70 72h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="52" cy="78" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M52 74.5c0-2 1.5-3.5 3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </IllustrationWrap>
  );
}

const ILLUSTRATIONS: Record<
  IllustrationVariant,
  () => React.JSX.Element
> = {
  list: EmptyIllustration,
  cost: CostEmptyIllustration,
};

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  illustration?: IllustrationVariant;
};

export function EmptyState({
  title,
  description,
  children,
  className = "",
  illustration = "list",
}: Props) {
  const Illustration = ILLUSTRATIONS[illustration];

  return (
    <div
      className={`card-dashed flex flex-col items-center px-6 py-10 text-center ${className}`}
    >
      <Illustration />
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-faint">{description}</p>
      {children ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">{children}</div>
      ) : null}
    </div>
  );
}
