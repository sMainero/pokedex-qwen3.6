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
  other?: {
    'official-artwork'?: {
      front_default?: string;
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
    other?: {
      'official-artwork'?: {
        front_default?: string;
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
