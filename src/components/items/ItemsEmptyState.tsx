function EmptyIllustration() {
  return (
    <div className="mb-4 text-slate-300" aria-hidden>
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
    </div>
  );
}

type Props = {
  onAdd: () => void;
  variant?: "no-items" | "category-empty";
  categoryName?: string;
  onShowAll?: () => void;
};

export function ItemsEmptyState({
  onAdd,
  variant = "no-items",
  categoryName,
  onShowAll,
}: Props) {
  const isCategoryEmpty = variant === "category-empty";

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10">
      <EmptyIllustration />
      <p className="text-center text-sm font-medium text-slate-700">
        {isCategoryEmpty && categoryName
          ? `「${categoryName}」에 항목이 없습니다`
          : "등록된 항목이 없습니다"}
      </p>
      <p className="mt-1 text-center text-xs text-slate-500">
        {isCategoryEmpty
          ? "다른 카테고리를 선택하거나 이 카테고리에 항목을 추가해 보세요"
          : "반복해서 관리할 일상을 추가해 보세요"}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {isCategoryEmpty && onShowAll && (
          <button
            type="button"
            onClick={onShowAll}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            전체 보기
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 항목 추가
        </button>
      </div>
    </div>
  );
}
