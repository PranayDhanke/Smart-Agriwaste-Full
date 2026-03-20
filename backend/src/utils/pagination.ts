export interface CursorPaginationInput {
  cursor: unknown;
  limit: unknown;
  defaultLimit: number;
  maxLimit: number;
}

export interface CursorPaginationResult {
  cursor?: string;
  limit: number;
}

export const parseCursorPagination = ({
  cursor,
  limit,
  defaultLimit,
  maxLimit,
}: CursorPaginationInput): CursorPaginationResult => {
  const parsedLimit = Number.parseInt(String(limit ?? ""), 10);
  const safeLimit = Number.isNaN(parsedLimit)
    ? defaultLimit
    : Math.min(Math.max(parsedLimit, 1), maxLimit);

  return {
    cursor: typeof cursor === "string" && cursor.trim() ? cursor : undefined,
    limit: safeLimit,
  };
};
