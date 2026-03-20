import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "../ui/button";

interface Props {
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export default function Paginations({ page, hasNext, onPageChange }: Props) {
  return (
    <Pagination className="mt-6 sm:mt-8">
      <PaginationContent className="flex-wrap justify-center gap-2 sm:gap-3">
        <Button variant={"ghost"} size="sm" className="px-2 sm:px-3" disabled={page === 1}>
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </Button>

        <PaginationItem>
          <span className="px-2 text-xs font-medium sm:px-4 sm:text-sm">Page {page}</span>
        </PaginationItem>

        <Button variant={"ghost"} size="sm" className="px-2 sm:px-3" disabled={!hasNext}>
          <PaginationNext
            onClick={() => hasNext && onPageChange(page + 1)}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </Button>
      </PaginationContent>
    </Pagination>
  );
}
