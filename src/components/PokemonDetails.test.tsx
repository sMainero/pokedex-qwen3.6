import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonDetails from './PokemonDetails';
import { Pokemon } from '../types/pokemon';

const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1',
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  stats: [
    { base_stat: 45, stat: { name: 'hp' } },
    { base_stat: 49, stat: { name: 'attack' } },
    { base_stat: 49, stat: { name: 'defense' } },
    { base_stat: 65, stat: { name: 'sp-atk' } },
    { base_stat: 65, stat: { name: 'sp-def' } },
    { base_stat: 45, stat: { name: 'speed' } },
  ],
  abilities: [{ ability: { name: 'overgrow' } }],
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
