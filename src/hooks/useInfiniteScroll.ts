import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  onScrollToBottom: () => void;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      console.log('useInfiniteScroll: no sentinel');
      return;
    }

    console.log('useInfiniteScroll: setting up observer');

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          console.log('useInfiniteScroll: triggering fetch');
          options.onScrollToBottom();
        }
      },
      {
        threshold: options.threshold ?? 0.5,
        rootMargin: options.rootMargin ?? '200px',
      }
    );

    observer.observe(sentinel);
    console.log('useInfiniteScroll: observer created and element observed');

    return () => {
      observer.disconnect();
      console.log('useInfiniteScroll: observer disconnected');
    };
  }, [options.threshold, options.rootMargin, options.onScrollToBottom]);

  return sentinelRef;
}
