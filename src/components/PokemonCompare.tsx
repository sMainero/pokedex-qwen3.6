import { Pokemon } from '../types/pokemon';
import './PokemonCompare.css';

interface PokemonCompareProps {
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  onRemove: (pokemon: Pokemon) => void;
  onBack: () => void;
}

function PokemonCompare({ pokemonA, pokemonB, onRemove, onBack }: PokemonCompareProps) {
  const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

  const getStatColor = (value: number) => {
    if (value >= 100) return '#43e97b';
    if (value >= 75) return '#4facfe';
    if (value >= 50) return '#a1c4fd';
    if (value >= 25) return '#f6d365';
    return '#e94560';
  };

  const getStatPercent = (value: number) => Math.min((value / 255) * 100, 100);

  // Compare a numeric stat between two pokemon
  const compareStat = (index: number) => {
    const valA = pokemonA.stats?.[index]?.base_stat || 0;
    const valB = pokemonB.stats?.[index]?.base_stat || 0;
    if (valA > valB) return 'a';
    if (valB > valA) return 'b';
    return 'tie';
  };

  const compareNumbers = (valA: number, valB: number) => {
    if (valA > valB) return 'a';
    if (valB > valA) return 'b';
    return 'tie';
  };

  const totalStatsA = pokemonA.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0;
  const totalStatsB = pokemonB.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0;

  const renderSprite = (pokemon: Pokemon) => (
    <div className="compare-sprite">
      <img
        src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '/images/pokemon-placeholder.png'}
        alt={pokemon.name}
        onError={(e) => { (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png'; }}
      />
    </div>
  );

  const renderStatRow = (index: number) => {
    const valA = pokemonA.stats?.[index]?.base_stat || 0;
    const valB = pokemonB.stats?.[index]?.base_stat || 0;
    const winner = compareStat(index);

    return (
      <div className="compare-stat-row" key={statLabels[index]}>
        <div
          className={`compare-stat-cell cell-a ${winner === 'a' ? 'winner' : winner === 'tie' ? 'tie' : ''}`}
        >
          <span className="stat-val">{valA}</span>
          <div className="stat-bar-mini">
            <div
              className="stat-fill-mini"
              style={{
                width: `${getStatPercent(valA)}%`,
                backgroundColor: getStatColor(valA),
              }}
            />
          </div>
        </div>
        <div className="compare-stat-label">{statLabels[index]}</div>
        <div
          className={`compare-stat-cell cell-b ${winner === 'b' ? 'winner' : winner === 'tie' ? 'tie' : ''}`}
        >
          <span className="stat-val">{valB}</span>
          <div className="stat-bar-mini">
            <div
              className="stat-fill-mini"
              style={{
                width: `${getStatPercent(valB)}%`,
                backgroundColor: getStatColor(valB),
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCompareRow = (label: string, valA: string | number, valB: string | number) => {
    const winner = typeof valA === 'number' && typeof valB === 'number'
      ? compareNumbers(valA, valB)
      : 'neutral';

    return (
      <div className="compare-row">
        <div className={`compare-cell cell-a ${winner === 'a' ? 'winner' : winner === 'tie' ? 'tie' : ''}`}>{valA}</div>
        <div className="compare-label">{label}</div>
        <div className={`compare-cell cell-b ${winner === 'b' ? 'winner' : winner === 'tie' ? 'tie' : ''}`}>{valB}</div>
      </div>
    );
  };

  return (
    <div className="pokemon-compare">
      <div className="compare-header">
        <button className="back-btn" onClick={onBack} aria-label="Back to list">
          ← Back to List
        </button>
        <h2>Pokémon Comparison</h2>
      </div>

      {/* Sprite row */}
      <div className="compare-sprites-row">
        <div className="compare-column col-a">
          {renderSprite(pokemonA)}
          <h3>{pokemonA.name.toUpperCase()} <span className="compare-id">#{pokemonA.id.toString().padStart(3, '0')}</span></h3>
          <button className="remove-btn" onClick={() => onRemove(pokemonA)} aria-label={`Remove ${pokemonA.name}`}>✕ Remove</button>
        </div>
        <div className="compare-vs">VS</div>
        <div className="compare-column col-b">
          {renderSprite(pokemonB)}
          <h3>{pokemonB.name.toUpperCase()} <span className="compare-id">#{pokemonB.id.toString().padStart(3, '0')}</span></h3>
          <button className="remove-btn" onClick={() => onRemove(pokemonB)} aria-label={`Remove ${pokemonB.name}`}>✕ Remove</button>
        </div>
      </div>

      {/* Types */}
      <div className="compare-section">
        <h3>Types</h3>
        <div className="compare-row">
          <div className="compare-cell cell-a">
            <div className="types-container">
              {pokemonA.types?.map(t => (
                <span key={t.type.name} className={`pokemon-type type-${t.type.name}`}>{t.type.name}</span>
              ))}
            </div>
          </div>
          <div className="compare-label">Types</div>
          <div className="compare-cell cell-b">
            <div className="types-container">
              {pokemonB.types?.map(t => (
                <span key={t.type.name} className={`pokemon-type type-${t.type.name}`}>{t.type.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Physical attributes */}
      <div className="compare-section">
        <h3>Physical</h3>
        {renderCompareRow('Height', pokemonA.height ? `${(pokemonA.height / 10).toFixed(1)} m` : '—', pokemonB.height ? `${(pokemonB.height / 10).toFixed(1)} m` : '—')}
        {renderCompareRow('Weight', pokemonA.weight ? `${(pokemonA.weight / 10).toFixed(1)} kg` : '—', pokemonB.weight ? `${(pokemonB.weight / 10).toFixed(1)} kg` : '—')}
        {renderCompareRow('Base Exp', pokemonA.base_experience ?? '—', pokemonB.base_experience ?? '—')}
      </div>

      {/* Abilities */}
      <div className="compare-section">
        <h3>Abilities</h3>
        <div className="compare-row">
          <div className="compare-cell cell-a abilities-cell">
            {pokemonA.abilities?.map(a => (
              <span key={a.ability.name} className="ability-tag">{a.ability.name.replace('-', ' ')}</span>
            ))}
          </div>
          <div className="compare-label">Abilities</div>
          <div className="compare-cell cell-b abilities-cell">
            {pokemonB.abilities?.map(a => (
              <span key={a.ability.name} className="ability-tag">{a.ability.name.replace('-', ' ')}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="compare-section">
        <h3>Base Stats</h3>
        <div className="compare-stats-header">
          <div className="compare-stat-label">Stat</div>
          <div className="compare-stat-cell cell-a">
            <span className="stat-val">{totalStatsA}</span>
            <div className="stat-bar-mini">
              <div className="stat-fill-mini" style={{ width: `${getStatPercent(totalStatsA)}%`, backgroundColor: '#e94560' }} />
            </div>
          </div>
          <div className="compare-stat-label">Total</div>
          <div className="compare-stat-cell cell-b">
            <span className="stat-val">{totalStatsB}</span>
            <div className="stat-bar-mini">
              <div className="stat-fill-mini" style={{ width: `${getStatPercent(totalStatsB)}%`, backgroundColor: '#e94560' }} />
            </div>
          </div>
        </div>
        {Array.from({ length: 6 }, (_, i) => renderStatRow(i))}
      </div>
    </div>
  );
}

export default PokemonCompare;
