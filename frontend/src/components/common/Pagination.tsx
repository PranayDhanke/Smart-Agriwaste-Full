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
    <Pagination className="mt-8">
      <PaginationContent>
        <Button variant={"ghost"} disabled={page === 1}>
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page === 1 ? "pointer-events-none nopacity-50" : ""}
          />{" "}
        </Button>

        <PaginationItem>
          <span className="px-4 text-sm font-medium">Page {page}</span>
        </PaginationItem>

        <Button variant={"ghost"} disabled={!hasNext}>
          <PaginationNext
            onClick={() => hasNext && onPageChange(page + 1)}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </Button>
      </PaginationContent>
    </Pagination>
  );
}
