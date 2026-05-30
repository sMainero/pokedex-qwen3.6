# AGENTS.md — Pokedex React App

> **MANDATORY SYNC RULE:** This file and `copilot-instructions.md` are mirrors. Any agent that modifies one MUST update the other identically. Keep them in sync on every change. If you edit code, architecture, commands, patterns, or any section below — update both files.

---

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
├── index.tsx                  # Entry point, wraps App in ErrorBoundary + PokemonProvider
├── App.tsx                    # Root component: generation tabs, search, pokemon list, infinite scroll
├── App.css                    # All styles (consolidated, single source of truth)
├── index.css                  # Global resets
├── types/
│   ├── pokemon.ts             # Pokemon, GenerationResponse, GenerationPokemonSpecies interfaces
│   ├── pagination.ts          # PaginationState, FetchPokemonParams (legacy, unused)
│   └── components.ts          # Shared component prop types
├── hooks/
│   ├── usePokemonData.ts      # Data fetching + search filtering (unused)
│   ├── useInfiniteScroll.ts   # IntersectionObserver-based infinite scroll hook (unused)
│   ├── useInfinitePagination.ts # 25-item chunk loading with IntersectionObserver trigger
│   └── useSearchFilter.ts     # Search filtering within context data
├── contexts/
│   └── PokemonContext.tsx     # React context for all species data (localStorage cache + API fetch)
└── components/
    ├── PokemonList.tsx        # Grid of Pokémon cards (lazy-loaded images, compare toggle)
    ├── PokemonDetails.tsx     # Detail view with stats, types, abilities
    ├── PokemonCompare.tsx     # Comparison view for 2-4 Pokémon (dynamic N-column layout)
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
- **Context caching:** `PokemonContext` fetches all generations on mount, caches to localStorage (24h TTL)
- **Infinite pagination:** `useInfinitePagination` loads 25 items at a time via IntersectionObserver
- **Image fallback:** All `<img>` tags have `onError` handler pointing to `/images/pokemon-placeholder.png`
- **Legacy:** `useInfiniteScroll`, `LoadingMore`, and `pagination.ts` remain in codebase but unused

### Styling
- **App-level CSS:** `src/App.css` — global styles, type gradients, skeleton animation, dark theme
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
- Manages `searchTerm`, `allSpecies`, `filteredSpecies`, `selectedPokemon`, `currentGeneration` state
- On mount: fetches Gen 1 species list
- On gen change: fetches `/generation/{n}`, extracts `pokemon_species[]` — **compare state preserved** (cross-gen)
- Handles search filtering (by name or ID) within current generation
- **Compare mode:** select 2-4 Pokémon via toggle button, fetch details on selection, explicit "Start Comparison" button, "Stop Selecting" to cancel
- Renders `GenerationTabs`, `PokemonList`, `PokemonDetails`, or `PokemonCompare` based on state

### `PokemonList.tsx`
- **Props:** `speciesList`, `onSelect`, `onCompareToggle`, `compareSelectedIds`, `isCompareMode`, `compareMaxReached`
- Renders grid of clickable cards with lazy-loaded sprites
- Pagination handled by parent via `useInfinitePagination` (25 items per chunk)
- In compare mode: shows "+ Compare" / "✓ Selected" button per card, disabled at 4 max
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

### `PokemonCompare.tsx`
- **Props:** `pokemonList` (array of 2-4 `Pokemon`), `onRemove`, `onBack`
- Renders dynamic N-column layout (2-4 columns) with VS separators
- Stat comparison: highlights winner per stat across all Pokémon (green), ties in yellow
- Types, abilities, physical attributes shown per column
- Individual remove button per Pokémon; below 2 exits comparison view

### `useInfinitePagination.ts` (Active)
- **Returns:** `{ visibleItems, hasMore, loadMoreRef }`
- Uses `IntersectionObserver` with 200px rootMargin to trigger loading
- Loads 25 items per chunk, resets on search/filter change
- `loadMoreRef` attached to sentinel element below grid

### `useInfiniteScroll.ts` (Legacy)
- **Returns:** `ref` to attach to scroll container
- **Options:** `threshold`, `rootMargin`, `onScrollToBottom` callback
- Uses `IntersectionObserver` internally
- **Note:** Unused

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
4. **New API call:** Add types to `src/types/pokemon.ts`, use `fetch` with error handling
5. **New env var:** Add to `.env.example`, document in `.env`, reference in code

---

## Known Limitations

- `usePokemonData.ts` is not wired into `App.tsx` — app fetches data directly via generation endpoint
- `useInfiniteScroll`, `LoadingMore`, and `pagination.ts` are legacy files, unused but present
- No React Query / TanStack Query for caching (was planned but not installed)
- No linting config (ESLint/Prettier not configured)
- Tests cover main components but not hooks or the root App
- Fetching all pokemon in a generation can be slow (sequential batches of 20)
- Compare mode fetches each Pokémon detail on selection (individual API calls) — no batch caching

---

## Agent Update Checklist

After every code change, update **both** `AGENTS.md` and `copilot-instructions.md`:

- [ ] Architecture tree matches `src/` structure
- [ ] Commands reflect current `package.json` scripts
- [ ] Key Patterns cover all active patterns (remove stale ones)
- [ ] Component Contracts match current prop signatures
- [ ] Known Limitations updated (remove resolved, add new)
- [ ] Both files are identical (content-wise, excluding the file-specific header)
