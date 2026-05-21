export function PageLoading({ message = "불러오는 중…" }: { message?: string }) {
  return <div className="page-loading">{message}</div>;
}
