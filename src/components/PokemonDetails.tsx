
import { useState } from 'react';
import { PokemonDetailsProps } from '../types/components';
import { getTypeMatchups } from '../types/pokemon';
import './PokemonDetails.css';

function PokemonDetails({ pokemon, onBack, isLoading }: PokemonDetailsProps & { isLoading?: boolean }) {
  const [isShiny, setIsShiny] = useState(false);
  const getStatBar = (value: number, max = 255) => {
    const percentage = Math.min((value / max) * 100, 100);
    return { percentage, color: getColorForStat(value) };
  };

  const getColorForStat = (value: number) => {
    if (value >= 100) return '#43e97b';
    if (value >= 75) return '#4facfe';
    if (value >= 50) return '#a1c4fd';
    if (value >= 25) return '#f6d365';
    return '#e94560';
  };

  const statData = [
    { label: 'HP', value: pokemon.stats?.[0]?.base_stat || 0 },
    { label: 'Attack', value: pokemon.stats?.[1]?.base_stat || 0 },
    { label: 'Defense', value: pokemon.stats?.[2]?.base_stat || 0 },
    { label: 'Sp. Atk', value: pokemon.stats?.[3]?.base_stat || 0 },
    { label: 'Sp. Def', value: pokemon.stats?.[4]?.base_stat || 0 },
    { label: 'Speed', value: pokemon.stats?.[5]?.base_stat || 0 },
  ];

  if (isLoading) {
    return (
      <div className="pokemon-details">
        <div className="loading-details">
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-details">
      <button className="back-btn" onClick={onBack} aria-label={`Back to Pokémon list`}>
        ← Back to List
      </button>

      <h2>{pokemon.name.toUpperCase()} - #{pokemon.id.toString().padStart(3, '0')}</h2>

      <div className="pokemon-image-large">
        <img
          src={isShiny
            ? (pokemon.sprites?.other?.['official-artwork'] as any)?.[`front_shiny`] ||
              pokemon.sprites?.front_shiny ||
              (pokemon.sprites?.other?.['official-artwork'] as any)?.front_default ||
              pokemon.sprites?.front_default ||
              '/images/pokemon-placeholder.png'
            : (pokemon.sprites?.other?.['official-artwork'] as any)?.front_default ||
              pokemon.sprites?.front_default ||
              '/images/pokemon-placeholder.png'}
          alt={pokemon.name}
          style={{ width: '250px', height: '250px' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png';
          }}
        />
      </div>

      <div className="shiny-toggle-container">
        <button
          className="shiny-toggle-btn"
          onClick={() => setIsShiny(!isShiny)}
          aria-pressed={isShiny}
          aria-label={isShiny ? 'Show normal form' : 'Show shiny form'}
        >
          ✨ {isShiny ? 'Normal' : 'Shiny'}
        </button>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Types</h3>
          <div className="types-container">
            {pokemon.types?.map((type) => (
              <span
                key={type.type.name}
                className={`pokemon-type type-${type.type.name}`}
              >
                {type.type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <h3>Base Experience</h3>
          <p>{pokemon.base_experience}</p>
        </div>

        <div className="detail-card">
          <h3>Height</h3>
          <p>{pokemon.height ? pokemon.height / 10 : '—'} m</p>
        </div>

        <div className="detail-card">
          <h3>Weight</h3>
          <p>{pokemon.weight ? pokemon.weight / 10 : '—'} kg</p>
        </div>

        <div className="detail-card">
          <h3>Abilities</h3>
          <div className="abilities-container">
            {pokemon.abilities?.map((ability) => (
              <span key={ability.ability.name} className="pokemon-type type-normal">
                {ability.ability.name.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <h3>Stats</h3>
          <div className="stats-container">
            {statData.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-label">
                  {stat.label}
                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{
                        width: `${getStatBar(stat.value).percentage}%`,
                        backgroundColor: getStatBar(stat.value).color,
                      }}
                    />
                  </div>
                </div>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <h3>Matchups</h3>
          <div className="matchups-container">
            {pokemon.types && pokemon.types.length > 0 && (() => {
              const matchups = getTypeMatchups(pokemon.types.map(t => t.type.name));
              return (
                <>
                  {matchups.strongAgainst.length > 0 && (
                    <div className="matchup-section">
                      <span className="matchup-label matchup-strong">Strong Against</span>
                      <div className="matchup-types">
                        {matchups.strongAgainst.map(type => (
                          <span key={type} className={`matchup-type type-${type}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchups.weakAgainst.length > 0 && (
                    <div className="matchup-section">
                      <span className="matchup-label matchup-weak">Weak Against</span>
                      <div className="matchup-types">
                        {matchups.weakAgainst.map(type => (
                          <span key={type} className={`matchup-type type-${type}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchups.noEffect.length > 0 && (
                    <div className="matchup-section">
                      <span className="matchup-label matchup-immune">No Effect</span>
                      <div className="matchup-types">
                        {matchups.noEffect.map(type => (
                          <span key={type} className={`matchup-type type-${type}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchups.strongAgainst.length === 0 && matchups.weakAgainst.length === 0 && matchups.noEffect.length === 0 && (
                    <p className="no-matchups">No special matchups</p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
