interface GenerationTabsProps {
  selectedGenerations: number[];
  onGenerationToggle: (generation: number) => void;
  isLoading: boolean;
  allGenerationsLoaded: boolean;
}

const GENERATIONS = [
  { id: 1, label: 'Gen 1', count: 151 },
  { id: 2, label: 'Gen 2', count: 100 },
  { id: 3, label: 'Gen 3', count: 135 },
  { id: 4, label: 'Gen 4', count: 107 },
  { id: 5, label: 'Gen 5', count: 156 },
  { id: 6, label: 'Gen 6', count: 72 },
  { id: 7, label: 'Gen 7', count: 88 },
  { id: 8, label: 'Gen 8', count: 96 },
  { id: 9, label: 'Gen 9', count: 120 },
];

function GenerationTabs({
  selectedGenerations,
  onGenerationToggle,
  isLoading,
  allGenerationsLoaded,
}: GenerationTabsProps) {
  const allSelected = allGenerationsLoaded && selectedGenerations.length === GENERATIONS.length;

  const toggleAll = () => {
    if (allSelected) {
      // Deselect all
      GENERATIONS.forEach(gen => onGenerationToggle(gen.id));
    } else {
      // Select all
      GENERATIONS.forEach(gen => {
        if (!selectedGenerations.includes(gen.id)) {
          onGenerationToggle(gen.id);
        }
      });
    }
  };

  return (
    <nav className="generation-tabs" aria-label="Filter by Pokémon generation">
      <ul>
        <li>
          <button
            className={`gen-tab ${allSelected ? 'active' : ''}`}
            onClick={toggleAll}
            disabled={isLoading}
            aria-pressed={allSelected}
            aria-label={allSelected ? 'Deselect all generations' : 'Select all generations'}
          >
            All
          </button>
        </li>
        {GENERATIONS.map((gen) => {
          const isSelected = selectedGenerations.includes(gen.id);
          return (
            <li key={gen.id}>
              <button
                className={`gen-tab ${isSelected ? 'active' : ''}`}
                onClick={() => onGenerationToggle(gen.id)}
                disabled={isLoading}
                aria-pressed={isSelected}
                aria-label={`Generation ${gen.id}: ${gen.count} Pokémon`}
              >
                {gen.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default GenerationTabs;
