---
goal: Enhance Pokemon comparison: 2-4 pokemon, explicit start/stop button, cross-gen support
version: 1.0
date_created: 2026-05-24
last_updated: 2026-05-24
owner: agent
status: 'Planned'
tags: [feature, comparison, ui]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Enhance existing Pokemon comparison feature. Current: hardcoded 2 pokemon, auto-fetch at 2, same-gen only, clears on gen switch. Target: select 2-4 pokemon, explicit "Start Comparison" button, cross-gen comparison, "Stop Selecting" to cancel.

## 1. Requirements & Constraints

- **REQ-001**: Minimum 2 pokemon required to start comparison
- **REQ-002**: Maximum 4 pokemon allowed in comparison
- **REQ-003**: Explicit "Start Comparison" button (no auto-fetch on selection)
- **REQ-004**: "Stop Selecting" button to exit compare mode without comparing
- **REQ-005**: Cross-gen comparison — selected pokemon persist across generation tab changes
- **REQ-006**: Selected pokemon shown as chips/pills in compare mode bar
- **REQ-007**: Remove individual pokemon from selection without exiting compare mode
- **CON-001**: Compare state must survive generation tab changes
- **CON-002**: Compare state must reset only on explicit "Stop Selecting" or "Back to List"
- **CON-003**: PokemonCompare must render 2-4 columns dynamically
- **PAT-001**: Store selected pokemon as `Pokemon[]` (fetched on selection) for cross-gen display
- **PAT-002**: Use `Pokemon.id` as unique key for selection set
- **GUD-001**: Keep all CSS in `App.css` + `PokemonCompare.css` only
- **GUD-002**: Update both `AGENTS.md` and `copilot-instructions.md` after implementation

## 2. Implementation Steps

### Implementation Phase 1 — App.tsx state refactor

- GOAL-001: Replace ID-based selection with fetched Pokemon objects. Add explicit start/stop flow. Cross-gen persistence.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Replace `compareSelectedIds: Set<number>` with `compareSelected: Pokemon[]` in App state | | |
| TASK-002 | Replace `toggleCompareSelection(species)` with `addToCompare(species)` — fetch pokemon detail on click, push to array if not present (max 4). Remove if already selected | | |
| TASK-003 | Remove auto-fetch logic (delete `if (newSet.size === 2) fetchComparePokemon()` block) | | |
| TASK-004 | Add `startComparison()` handler: if `compareSelected.length >= 2`, fetch all details, call `setComparePokemon(compareSelected)`, set `compareViewActive = true` | | |
| TASK-005 | Add `stopSelecting()` handler: clear `compareSelected`, exit compare mode | | |
| TASK-006 | Remove compare state reset from `handleGenerationChange()` — keep `compareSelected` across gen changes | | |
| TASK-007 | Update `toggleCompareMode()`: entering mode clears nothing (preserves prior selection if any). Exiting mode calls `stopSelecting()` | | |
| TASK-008 | Add `removeFromCompare(pokemonId)` handler — remove single pokemon from selection array | | |
| TASK-009 | Update JSX: replace compare-mode-bar with new bar showing selected chips, "Start Comparison" button (disabled < 2), "Stop Selecting" button | | |
| TASK-010 | Update render condition: show `PokemonCompare` when `compareViewActive` is true (not hardcoded `comparePokemon.length === 2`) | | |

### Implementation Phase 2 — PokemonList.tsx update

- GOAL-002: Support 2-4 selection, show selected count, pass correct handlers

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Update `toggleCompareSelection` prop to `onCompareToggle` — single handler for add/remove | | |
| TASK-012 | Update card: show "✓ Selected" / "+ Compare" based on whether pokemon is in `compareSelected` (check by id) | | |
| TASK-013 | Disable "+ Compare" button visually when 4 already selected (prop `compareMaxReached`) | | |

### Implementation Phase 3 — PokemonCompare.tsx rewrite

- GOAL-003: Accept `Pokemon[]` (2-4), render N columns dynamically, highlight winners across all

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | Change `PokemonCompareProps` to `pokemonList: Pokemon[]` (min 2, max 4). Remove `pokemonA`/`pokemonB` | | |
| TASK-015 | Rewrite sprite row: map over `pokemonList`, render N columns with sprite, name, id, remove button | | |
| TASK-016 | Rewrite stat comparison: for each stat row, find max value across all pokemon, highlight winner(s). Handle ties | | |
| TASK-017 | Rewrite types/abilities/physical sections: map over N columns instead of hardcoded A/B | | |
| TASK-018 | Add "VS" separators between columns (N-1 separators) | | |
| TASK-019 | Update `renderCompareRow` to accept array of values, highlight winner across N | | |

### Implementation Phase 4 — Types update

- GOAL-004: Update TypeScript interfaces

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-020 | Update `PokemonCompareProps` in `types/components.ts`: `pokemonList: Pokemon[]`, remove `pokemonA`/`pokemonB` | | |
| TASK-021 | Update `PokemonListProps`: rename `onCompare` to `onCompareToggle`, add `compareMaxReached?: boolean` | | |

### Implementation Phase 5 — Styles

- GOAL-005: CSS for N-column layout, compare bar with chips, start/stop buttons

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-022 | Add `.compare-chip` style in App.css: small removable pill with pokemon name/id | | |
| TASK-023 | Add `.compare-chips-container` flex row in App.css | | |
| TASK-024 | Add `.start-compare-btn` style (primary action, disabled state) in App.css | | |
| TASK-025 | Add `.stop-selecting-btn` style (secondary/ghost) in App.css | | |
| TASK-026 | Update `PokemonCompare.css`: replace `.cell-a`/`.cell-b` with dynamic column grid (`grid-template-columns: repeat(N, 1fr)`) | | |
| TASK-027 | Add responsive breakpoint for 4-column compare (stack on mobile) | | |

### Implementation Phase 6 — Docs sync

- GOAL-006: Update AGENTS.md and copilot-instructions.md

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-028 | Update Component Contract for `PokemonCompare` (new props, N-column behavior) | | |
| TASK-029 | Update Component Contract for `PokemonList` (new compare props) | | |
| TASK-030 | Update Architecture tree if files added/removed | | |
| TASK-031 | Update Known Limitations if applicable | | |
| TASK-032 | Mirror all changes to `copilot-instructions.md` | | |

## 3. Alternatives

- **ALT-001**: Store only `GenerationPokemonSpecies[]` in selection, fetch details at "Start Comparison" time. Rejected — cross-gen means species from different gens, need fetched details for chips display (sprite, types)
- **ALT-002**: Use a modal/dialog for comparison instead of full-page view. Rejected — current pattern is full-page replace, consistent with PokemonDetails
- **ALT-003**: Fetch all 4 pokemon details upfront on each selection click. Chosen — simpler state, chips show sprite immediately

## 4. Dependencies

- **DEP-001**: PokeAPI `pokemon/{name}` endpoint (existing, no change)
- **DEP-002**: React 18, TypeScript 5 (existing)
- **DEP-003**: No new libraries required

## 5. Files

| File | Action |
|------|--------|
| `src/App.tsx` | Modify — refactor compare state, add start/stop handlers, cross-gen persistence |
| `src/components/PokemonList.tsx` | Modify — update compare toggle, max 4, disable at cap |
| `src/components/PokemonCompare.tsx` | Rewrite — N-column dynamic layout |
| `src/types/components.ts` | Modify — update prop interfaces |
| `src/App.css` | Modify — add compare bar, chips, start/stop button styles |
| `src/components/PokemonCompare.css` | Modify — dynamic N-column grid |
| `AGENTS.md` | Modify — sync docs |
| `copilot-instructions.md` | Modify — sync docs |

## 6. Testing

- **TEST-001**: Verify compare mode toggle enters/exits correctly
- **TEST-002**: Verify selection allows 2-4 pokemon (rejects 5th)
- **TEST-003**: Verify "Start Comparison" disabled with < 2 selected
- **TEST-004**: Verify "Stop Selecting" clears selection and exits mode
- **TEST-005**: Verify cross-gen: select pokemon from Gen 1, switch to Gen 2, selection persists
- **TEST-006**: Verify individual pokemon removal from selection
- **TEST-007**: Verify PokemonCompare renders 2, 3, and 4 columns correctly
- **TEST-008**: Verify stat winner highlighting works across N pokemon

## 7. Risks & Assumptions

- **RISK-001**: Fetching pokemon detail on each selection click adds latency. Mitigation: show loading state on chip while fetching
- **RISK-002**: Cross-gen selection means `allSpecies` won't contain selected pokemon from other gens. Mitigation: store as `Pokemon[]` not species references
- **ASSUMPTION-001**: User wants to see selected pokemon as chips with sprite in the compare bar
- **ASSUMPTION-002**: "Stop Selecting" = full reset (clear selection + exit compare mode)

## 8. Related Specifications / Further Reading

- [PokeAPI Generation endpoint](https://pokeapi.co/docs/v2#generation)
- [PokeAPI Pokemon endpoint](https://pokeapi.co/docs/v2#pokemon)
