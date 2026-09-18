import { useEffect, useRef } from 'react'

export function useInfiniteScroll(loadMore, { hasMore = true, threshold = 200 } = {}) {
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: `${threshold}px` },
    )

    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loadMore, threshold])

  return sentinelRef
}
