import { useCallback, useMemo, useState } from 'react';

export function usePagination({ initialPage = 1, initialLimit = 10, totalItems = 0 }: any) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / limit)),
    [totalItems, limit],
  );

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage((p) => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage((p) => p - 1);
  }, [hasPrevPage]);

  const goToPage = useCallback(
    (target) => {
      const clamped = Math.min(Math.max(1, target), totalPages);
      setPage(clamped);
    },
    [totalPages],
  );

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
    setLimit,
  };
}
