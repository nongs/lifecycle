import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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
    <EmptyState
      title={
        isCategoryEmpty && categoryName
          ? `「${categoryName}」에 항목이 없습니다`
          : "등록된 항목이 없습니다"
      }
      description={
        isCategoryEmpty
          ? "다른 카테고리를 선택하거나 이 카테고리에 항목을 추가해 보세요"
          : "반복해서 관리할 일상을 추가해 보세요"
      }
    >
      {isCategoryEmpty && onShowAll ? (
        <Button variant="secondary" onClick={onShowAll}>
          전체 보기
        </Button>
      ) : null}
      <Button onClick={onAdd}>+ 항목 추가</Button>
    </EmptyState>
  );
}
