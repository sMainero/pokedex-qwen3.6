import React, { useEffect, useState } from 'react';
import { Pokemon } from '../types/pokemon';

interface ClashOverlayProps {
  pokemonList: Pokemon[];
  onComplete: () => void;
}

function ClashOverlay({ pokemonList, onComplete }: ClashOverlayProps) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(onComplete, 300);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getStartPercent = (index: number, total: number) => {
    if (total === 2) return index === 0 ? 20 : 80;
    if (total === 3) return index === 0 ? 18 : index === 1 ? 50 : 82;
    return [15, 37, 63, 85][index] ?? 50;
  };

  const getDirection = (index: number, total: number) => {
    const start = getStartPercent(index, total);
    if (start < 40) return 'left';
    if (start > 60) return 'right';
    return 'center';
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const sparks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    const distance = 60 + Math.random() * 80;
    const size = 4 + Math.random() * 8;
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#FF6347'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rad = toRad(angle);
    return {
      id: i,
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      size,
      color,
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className={`clash-overlay ${animating ? 'active' : 'exiting'}`}>
      <div className="clash-sprites">
        {pokemonList.map((pokemon, index) => {
          const direction = getDirection(index, pokemonList.length);
          const startLeft = getStartPercent(index, pokemonList.length);

          return (
            <div
              key={pokemon.id}
              className={`clash-sprite clash-from-${direction}`}
              style={{ left: `${startLeft}%` }}
            >
              <img
                src={
                  pokemon.sprites?.other?.['official-artwork']?.front_default ||
                  pokemon.sprites?.front_default ||
                  '/images/pokemon-placeholder.png'
                }
                alt={pokemon.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png';
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="clash-spark-container">
        <div className="spark-burst" />
        <div className="spark-ring" />
        <div className="spark-ring spark-ring-delayed" />
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="spark-particle"
            style={{
              '--spark-tx': `${spark.tx}px`,
              '--spark-ty': `${spark.ty}px`,
              '--spark-size': `${spark.size}px`,
              '--spark-delay': `${spark.delay}s`,
              '--spark-color': spark.color,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="clash-vs">VS!</div>
    </div>
  );
}

export default ClashOverlay;
