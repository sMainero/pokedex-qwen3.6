import { useState, useRef, useEffect } from 'react';
import { GenerationPokemonSpecies } from '../types/pokemon';

export interface UseInfinitePaginationOptions {
  items: GenerationPokemonSpecies[];
  pageSize: number;
}

export interface UseInfinitePaginationReturn {
  visibleItems: GenerationPokemonSpecies[];
  hasMore: boolean;
  loadMoreRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function useInfinitePagination({
  items,
  pageSize = 25,
}: UseInfinitePaginationOptions): UseInfinitePaginationReturn {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  // IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + pageSize, items.length));
        }
      },
      { root: null, rootMargin: '200px' },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, pageSize, items.length]);

  // Reset when items change (e.g. search/filter)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  return {
    visibleItems,
    hasMore,
    loadMoreRef,
  };
}
