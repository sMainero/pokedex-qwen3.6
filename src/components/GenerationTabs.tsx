interface GenerationTabsProps {
  currentGeneration: number;
  onGenerationChange: (generation: number) => void;
  isLoading: boolean;
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
  currentGeneration,
  onGenerationChange,
  isLoading,
}: GenerationTabsProps) {
  return (
    <nav className="generation-tabs" aria-label="Select Pokémon generation">
      <ul>
        {GENERATIONS.map((gen) => (
          <li key={gen.id}>
            <button
              className={`gen-tab ${currentGeneration === gen.id ? 'active' : ''}`}
              onClick={() => onGenerationChange(gen.id)}
              disabled={isLoading}
              aria-pressed={currentGeneration === gen.id}
              aria-label={`Generation ${gen.id}: ${gen.count} Pokémon`}
            >
              {gen.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default GenerationTabs;
