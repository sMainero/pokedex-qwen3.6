# AGENTS.md — Pokedex React App

## Project Overview

A Pokémon encyclopedia built with React 18 + TypeScript + Vite. Fetches data from the [PokeAPI](https://pokeapi.co) and displays Pokémon with generation tabs (Gen 1–Gen 9), search, and detailed stat views.

**Stack:** React 18, TypeScript 5, Vite 8, Testing Library, CSS (no CSS-in-JS)

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npx tsc --noEmit` | Type-check without emitting files |

---

## Architecture

```
src/
├── index.tsx                  # Entry point, wraps App in ErrorBoundary
├── App.tsx                    # Root component: generation tabs, search, pokemon list
├── App.css                    # All styles (consolidated, single source of truth)
├── index.css                  # Global resets
├── types/
│   ├── pokemon.ts             # Pokemon, GenerationResponse, GenerationPokemonSpecies interfaces
│   ├── pagination.ts          # PaginationState, FetchPokemonParams (legacy, unused)
│   └── components.ts          # Shared component prop types
├── hooks/
│   ├── usePokemonData.ts      # Data fetching + search filtering (unused)
│   └── useInfiniteScroll.ts   # IntersectionObserver-based infinite scroll hook (unused)
└── components/
    ├── PokemonList.tsx        # Grid of Pokémon cards (lazy-loaded images)
    ├── PokemonDetails.tsx     # Detail view with stats, types, abilities
    ├── GenerationTabs.tsx     # Generation selector tabs (Gen 1-9)
    ├── ErrorBoundary.tsx      # Class-component error boundary with reload
    ├── Skeleton.tsx           # Loading skeleton placeholder
    └── LoadingMore.tsx        # "Loading more..." spinner (legacy, unused)
```

---

## Key Patterns

### Data Fetching
- **Generation endpoint:** `https://pokeapi.co/api/v2/generation/{1-9}` — returns `pokemon_species[]` with species name/URL
- **Pokemon detail endpoint:** `https://pokeapi.co/api/v2/pokemon/{speciesName}` — fetches full pokemon data
- **Batch fetching:** Pokemon fetched in batches of 20 to avoid API overload
- **No pagination:** All species in selected generation fetched and displayed at once
- **Image fallback:** All `<img>` tags have `onError` handler pointing to `/images/pokemon-placeholder.png`
- **Legacy:** `useInfiniteScroll`, `LoadingMore`, and `pagination.ts` remain in codebase but unused

### Styling
- **All CSS lives in `src/App.css`** — component-level `.css` files exist as placeholders only
- Type-specific gradient classes: `.type-fire`, `.type-water`, `.type-grass`, etc.
- Skeleton loading animation via CSS `@keyframes skeleton-loading`
- Dark theme with gradient backgrounds

### TypeScript
- Strict mode enabled in `tsconfig.json`
- All component props typed via `src/types/components.ts`
- API response shapes typed in `src/types/pokemon.ts` (`Pokemon`, `GenerationResponse`, `GenerationPokemonSpecies`)
- `PokemonType` shape: `{ slot: number, type: { name: string, url: string } }`

### Accessibility
- Skip navigation link
- `role="button"` + `tabIndex={0}` + keyboard handlers on Pokémon cards
- `aria-label` on interactive elements
- `role="search"` on search form
- Semantic HTML structure

### Environment Variables
- `REACT_APP_POKEMON_LIMIT` — total Pokémon to fetch (default: 151)
- `REACT_APP_API_BASE_URL` — API base URL (default: `https://pokeapi.co/api/v2`)
- Copy `.env.example` to `.env` to configure

---

## Component Contract

### `App.tsx` (Root)
- Manages `searchTerm`, `allPokemon`, `filteredPokemon`, `selectedPokemon`, `currentGeneration` state
- On mount: fetches Gen 1 pokemon
- On gen change: fetches `/generation/{n}`, extracts `pokemon_species[]`, fetches each pokemon detail in batches of 20
- Handles search filtering (by name or ID) within current generation
- Renders `GenerationTabs`, `PokemonList`, or `PokemonDetails` based on state

### `PokemonList.tsx`
- **Props:** `pokemonList`, `onSelect`
- Renders grid of clickable cards with lazy-loaded sprites
- Keyboard accessible (Enter/Space to select)

### `GenerationTabs.tsx`
- **Props:** `currentGeneration` (number), `onGenerationChange` (callback), `isLoading` (boolean)
- Renders 9 pill-style tabs (Gen 1–Gen 9)
- Active tab highlighted with red background
- Disabled while loading
- Uses `aria-pressed` for accessibility

### `PokemonDetails.tsx`
- **Props:** `pokemon` (full detail object), `onBack`
- Fetches full details from API URL on mount
- Displays: large sprite, types, abilities, base stats (bar chart)
- Back button returns to list view

### `useInfiniteScroll.ts` (Legacy)
- **Returns:** `ref` to attach to scroll container
- **Options:** `threshold`, `rootMargin`, `onScrollToBottom` callback
- Uses `IntersectionObserver` internally
- **Note:** No longer used by App.tsx

### `usePokemonData.ts` (Legacy)
- **Returns:** `{ allPokemon, filteredPokemon, loading, error, setSearchTerm, reset }`
- Fetches bulk Pokémon list + individual detail requests
- Supports search filtering by name or ID
- **Note:** Not integrated into `App.tsx` — App uses direct fetch via generation endpoint

---

## Testing

- **Framework:** Testing Library + Jest DOM (`src/setupTests.ts`)
- **Test files:** `PokemonList.test.tsx`, `PokemonDetails.test.tsx`
- Tests use mock data and render components in isolation

---

## Adding New Features

1. **New component:** Add to `src/components/`, type props in `src/types/components.ts`, add styles to `src/App.css`
2. **Generation data:** Add types to `src/types/pokemon.ts` (use `GenerationResponse` as reference pattern)
3. **New hook:** Add to `src/hooks/`, export with clear return type
3. **New API call:** Add types to `src/types/pokemon.ts`, use `fetch` with error handling
4. **New env var:** Add to `.env.example`, document in `.env`, reference in code

---

## Known Limitations

- `usePokemonData.ts` is not wired into `App.tsx` — app fetches data directly via generation endpoint
- `useInfiniteScroll`, `LoadingMore`, and `pagination.ts` are legacy files, unused but present
- No React Query / TanStack Query for caching (was planned but not installed)
- No linting config (ESLint/Prettier not configured)
- Tests cover main components but not hooks or the root App
- Fetching all pokemon in a generation can be slow (sequential batches of 20)
