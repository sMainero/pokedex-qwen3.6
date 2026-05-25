import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonDetails from './PokemonDetails';
import { Pokemon } from '../types/pokemon';

const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1',
  types: [
    { slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12' } },
    { slot: 2, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4' } },
  ],
  stats: [
    { base_stat: 45, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1' } },
    { base_stat: 49, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2' } },
    { base_stat: 49, stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/3' } },
    { base_stat: 65, stat: { name: 'sp-atk', url: 'https://pokeapi.co/api/v2/stat/4' } },
    { base_stat: 65, stat: { name: 'sp-def', url: 'https://pokeapi.co/api/v2/stat/5' } },
    { base_stat: 45, stat: { name: 'speed', url: 'https://pokeapi.co/api/v2/stat/6' } },
  ],
  abilities: [{ ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65' } }],
  height: 7,
  weight: 69,
  base_experience: 60,
  sprites: {
    other: {
      'official-artwork': {
        front_default: 'https://example.com/bulbasaur.png',
      },
    },
  },
};

const mockBackCallback = jest.fn();

describe('PokemonDetails', () => {
  it('renders pokemon name and ID', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText('BULBASAUR')).toBeInTheDocument();
    expect(screen.getByText('#001')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText(/back to list/i)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    const backButton = screen.getByRole('button', { name: /back to list/i });
    fireEvent.click(backButton);
    expect(mockBackCallback).toHaveBeenCalled();
  });

  it('renders types', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText(/grass/i)).toBeInTheDocument();
    expect(screen.getByText(/poison/i)).toBeInTheDocument();
  });

  it('renders height and weight', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText('0.7 m')).toBeInTheDocument();
    expect(screen.getByText('6.9 kg')).toBeInTheDocument();
  });

  it('renders abilities', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText(/overgrow/i)).toBeInTheDocument();
  });

  it('renders stats with bar visualization', () => {
    render(
      <PokemonDetails
        pokemon={mockPokemon}
        onBack={mockBackCallback}
      />
    );
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('49')).toBeInTheDocument();
  });
});
