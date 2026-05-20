export interface PaginationState {
  page: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasFetched: boolean;
}

export interface FetchPokemonParams {
  limit: number;
  offset: number;
}
