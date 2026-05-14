import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function TablePagination({
  page,
  totalPages,
  total,
  perPage,
  onPrev,
  onNext,
}: Props) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div className="flex gap-1.5">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-border text-muted-foreground disabled:opacity-40 hover:bg-accent transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-border text-muted-foreground disabled:opacity-40 hover:bg-accent transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
