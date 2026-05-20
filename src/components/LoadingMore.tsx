import React, { forwardRef } from 'react';

interface LoadingMoreProps {
  isLoading?: boolean;
  hasMore?: boolean;
}

const LoadingMore = forwardRef<HTMLDivElement, LoadingMoreProps>(({ isLoading, hasMore }, ref) => {
  console.log('LoadingMore rendered, isLoading:', isLoading, 'hasMore:', hasMore);
  if (!isLoading && !hasMore) {
    return (
      <div className="no-more-pokemon" ref={ref}>
        <p>You've seen all 151 Pokémon!</p>
      </div>
    );
  }

  return (
    <div className="loading-more" ref={ref}>
      <div className="loading-spinner" />
      <p>Loading more Pokémon...</p>
    </div>
  );
});

LoadingMore.displayName = 'LoadingMore';

export default LoadingMore;
