// Pokemon-related TypeScript interfaces

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

// Generation API response types
export interface GenerationPokemonSpecies {
  name: string;
  url: string;
  generation: number;
}

export interface GenerationResponse {
  id: number;
  name: string;
  pokemon_species: GenerationPokemonSpecies[];
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonVersion {
  name: string;
  version_name: string;
  url: string;
}

export interface PokemonSprite {
  front_default?: string;
  front_shiny?: string;
  other?: {
    'official-artwork'?: {
      front_default?: string;
      front_shiny?: string;
    };
  };
  versions?: {
    [key: string]: {
      black_white?: {
        front_default?: string;
      };
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  url: string;
  types: PokemonType[];
  sprites?: {
    front_default?: string;
    front_shiny?: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
        front_shiny?: string;
      };
    };
  };
  stats: PokemonStat[];
  abilities?: PokemonAbility[];
  height?: number;
  weight?: number;
  base_experience?: number;
}

export interface PokemonList {
  count: number;
  next?: string;
  previous?: string;
  results: Array<{
    name: string;
    url: string;
  }>;
}

// Type matchup data: attacker type -> defender type -> multiplier
export const TYPE_MATCHUPS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, electric: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeMatchups(pokemonTypes: string[]): {
  strongAgainst: string[];
  weakAgainst: string[];
  noEffect: string[];
} {
  const strongAgainst = new Set<string>();
  const weakAgainst = new Set<string>();
  const noEffect = new Set<string>();

  // Check each attacker type against this Pokémon's types
  for (const attackerType of Object.keys(TYPE_MATCHUPS)) {
    let totalMultiplier = 1;
    let hasNoEffect = false;

    for (const defenderType of pokemonTypes) {
      const multiplier = TYPE_MATCHUPS[attackerType]?.[defenderType] ?? 1;
      totalMultiplier *= multiplier;
      if (multiplier === 0) hasNoEffect = true;
    }

    if (hasNoEffect) {
      noEffect.add(attackerType);
    } else if (totalMultiplier >= 2) {
      strongAgainst.add(attackerType);
    } else if (totalMultiplier <= 0.5) {
      weakAgainst.add(attackerType);
    }
  }

  return {
    strongAgainst: Array.from(strongAgainst).sort(),
    weakAgainst: Array.from(weakAgainst).sort(),
    noEffect: Array.from(noEffect).sort(),
  };
}
