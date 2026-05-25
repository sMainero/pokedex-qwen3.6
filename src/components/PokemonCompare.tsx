import React, { useState } from 'react';
import { Pokemon } from '../types/pokemon';
import ClashOverlay from './ClashOverlay';
import './PokemonCompare.css';

interface PokemonCompareProps {
  pokemonList: Pokemon[];
  onRemove: (pokemon: Pokemon) => void;
  onBack: () => void;
}

function PokemonCompare({ pokemonList, onRemove, onBack }: PokemonCompareProps) {
  const [showClash, setShowClash] = useState(true);

  const handleClashComplete = () => {
    setShowClash(false);
  };
  const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

  const getStatColor = (value: number) => {
    if (value >= 100) return '#43e97b';
    if (value >= 75) return '#4facfe';
    if (value >= 50) return '#a1c4fd';
    if (value >= 25) return '#f6d365';
    return '#e94560';
  };

  const getStatPercent = (value: number) => Math.min((value / 255) * 100, 100);

  // Find max value for a stat index across all pokemon
  const getMaxStat = (index: number) => {
    return Math.max(...pokemonList.map(p => p.stats?.[index]?.base_stat || 0));
  };

  // Find max for numeric comparison
  const getMaxNumber = (values: number[]) => Math.max(...values);

  const renderSprite = (pokemon: Pokemon) => (
    <div className="compare-sprite">
      <img
        src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '/images/pokemon-placeholder.png'}
        alt={pokemon.name}
        onError={(e) => { (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png'; }}
      />
    </div>
  );

  const renderCompareColumn = (pokemon: Pokemon) => (
    <div className="compare-column">
      {renderSprite(pokemon)}
      <h3>
        {pokemon.name.toUpperCase()}{' '}
        <span className="compare-id">#{pokemon.id.toString().padStart(3, '0')}</span>
      </h3>
      <button
        className="remove-btn"
        onClick={() => onRemove(pokemon)}
        aria-label={`Remove ${pokemon.name}`}
      >
        ✕ Remove
      </button>
    </div>
  );

  const renderVsSeparator = () => <div className="compare-vs">VS</div>;

  // Render types row
  const renderTypesRow = () => (
    <div className="compare-section">
      <h3>Types</h3>
      <div className={`compare-row compare-row-${pokemonList.length}`}>
        {pokemonList.map(p => (
          <div key={p.id} className="compare-cell">
            <div className="types-container">
              {p.types?.map(t => (
                <span key={t.type.name} className={`pokemon-type type-${t.type.name}`}>
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render physical attributes
  const renderPhysicalSection = () => {
    const rows = [
      {
        label: 'Height',
        getValue: (p: Pokemon) => p.height ? `${(p.height / 10).toFixed(1)} m` : '—',
        getNumeric: (p: Pokemon) => p.height ?? -1,
      },
      {
        label: 'Weight',
        getValue: (p: Pokemon) => p.weight ? `${(p.weight / 10).toFixed(1)} kg` : '—',
        getNumeric: (p: Pokemon) => p.weight ?? -1,
      },
      {
        label: 'Base Exp',
        getValue: (p: Pokemon) => p.base_experience ?? '—',
        getNumeric: (p: Pokemon) => p.base_experience ?? -1,
      },
    ];

    return (
      <div className="compare-section">
        <h3>Physical</h3>
        {rows.map(row => {
          const values = pokemonList.map(row.getNumeric);
          const maxVal = getMaxNumber(values);
          return (
            <div key={row.label} className={`compare-row compare-row-${pokemonList.length}`}>
              {pokemonList.map(p => {
                const val = row.getNumeric(p);
                const isWinner = val === maxVal && maxVal > 0;
                const isTie = isWinner && values.filter(v => v === maxVal).length > 1;
                return (
                  <div
                    key={p.id}
                    className={`compare-cell ${isWinner ? 'winner' : ''} ${isTie ? 'tie' : ''}`}
                  >
                    {row.getValue(p)}
                  </div>
                );
              })}
              <div className="compare-label">{row.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render abilities
  const renderAbilitiesSection = () => (
    <div className="compare-section">
      <h3>Abilities</h3>
      <div className={`compare-row compare-row-${pokemonList.length}`}>
        {pokemonList.map(p => (
          <div key={p.id} className="compare-cell abilities-cell">
            {p.abilities?.map(a => (
              <span key={a.ability.name} className="ability-tag">
                {a.ability.name.replace('-', ' ')}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Render stats
  const renderStatsSection = () => {
    const totals = pokemonList.map(
      p => p.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0,
    );
    const maxTotal = getMaxNumber(totals);

    return (
      <div className="compare-section">
        <h3>Base Stats</h3>

        {/* Total row */}
        <div className={`compare-stats-header compare-row-${pokemonList.length}`}>
          {pokemonList.map((p, i) => {
            const isWinner = totals[i] === maxTotal;
            const isTie = isWinner && totals.filter(t => t === maxTotal).length > 1;
            return (
              <div key={p.id} className={`compare-stat-cell ${isWinner ? 'winner' : ''} ${isTie ? 'tie' : ''}`}>
                <span className="stat-val">{totals[i]}</span>
                <div className="stat-bar-mini">
                  <div
                    className="stat-fill-mini"
                    style={{ width: `${getStatPercent(totals[i])}%`, backgroundColor: '#e94560' }}
                  />
                </div>
              </div>
            );
          })}
          <div className="compare-stat-label">Total</div>
        </div>

        {/* Individual stat rows */}
        {statLabels.map((label, index) => {
          const maxStat = getMaxStat(index);
          const values = pokemonList.map(p => p.stats?.[index]?.base_stat || 0);
          const tieCount = values.filter(v => v === maxStat).length;

          return (
            <div key={label} className={`compare-stat-row compare-row-${pokemonList.length}`}>
              {pokemonList.map((p) => {
                const val = p.stats?.[index]?.base_stat || 0;
                const isWinner = val === maxStat;
                const isTie = isWinner && tieCount > 1;
                return (
                  <div key={p.id} className={`compare-stat-cell ${isWinner ? 'winner' : ''} ${isTie ? 'tie' : ''}`}>
                    <span className="stat-val">{val}</span>
                    <div className="stat-bar-mini">
                      <div
                        className="stat-fill-mini"
                        style={{
                          width: `${getStatPercent(val)}%`,
                          backgroundColor: getStatColor(val),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="compare-stat-label">{label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pokemon-compare">
      {showClash && (
        <ClashOverlay
          pokemonList={pokemonList}
          onComplete={handleClashComplete}
        />
      )}
      <div className="compare-header">
        <button className="back-btn" onClick={onBack} aria-label="Back to list">
          ← Back to List
        </button>
        <h2>Pokémon Comparison ({pokemonList.length})</h2>
      </div>

      {/* Sprite row */}
      <div className="compare-sprites-row">
        {pokemonList.map((p, idx) => (
          <React.Fragment key={p.id}>
            {renderCompareColumn(p)}
            {idx < pokemonList.length - 1 && renderVsSeparator()}
          </React.Fragment>
        ))}
      </div>

      {renderTypesRow()}
      {renderPhysicalSection()}
      {renderAbilitiesSection()}
      {renderStatsSection()}
    </div>
  );
}

export default PokemonCompare;
