import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export default function WastePagination({
  page,
  hasNext,
  onPageChange,
}: Props) {
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem
          className={
            page === 1 ? " opacity-50 cursor-not-allowed" : "cursor-pointer"
          }
        >
          <PaginationPrevious onClick={() => onPageChange(page - 1)} />
        </PaginationItem>

        <PaginationItem>
          <span className="px-4 text-sm font-medium">Page {page}</span>
        </PaginationItem>

        <PaginationItem
          className={
            !hasNext ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }
        >
          <PaginationNext onClick={() => onPageChange(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
