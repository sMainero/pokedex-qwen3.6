import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonList from './PokemonList';
import { GenerationPokemonSpecies } from '../types/pokemon';

const mockSpeciesList: GenerationPokemonSpecies[] = [
  {
    name: 'bulbasaur',
    url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
    generation: 1,
  },
  {
    name: 'charmander',
    url: 'https://pokeapi.co/api/v2/pokemon-species/4/',
    generation: 1,
  },
];

const mockSelectCallback = jest.fn();

describe('PokemonList', () => {
  it('renders no results message when list is empty', () => {
    render(
      <PokemonList
        speciesList={[]}
        onSelect={mockSelectCallback}
      />
    );
    expect(screen.getByText(/no pokemon found matching your search/i)).toBeInTheDocument();
  });

  it('renders pokemon cards when list has items', () => {
    render(
      <PokemonList
        speciesList={mockSpeciesList}
        onSelect={mockSelectCallback}
      />
    );
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('#001')).toBeInTheDocument();
    expect(screen.getByText('charmander')).toBeInTheDocument();
    expect(screen.getByText('#004')).toBeInTheDocument();
  });

  it('calls onSelect when pokemon card is clicked', () => {
    render(
      <PokemonList
        speciesList={mockSpeciesList}
        onSelect={mockSelectCallback}
      />
    );
    const card = screen.getByText('bulbasaur').parentElement;
    fireEvent.click(card!);
    expect(mockSelectCallback).toHaveBeenCalledWith(mockSpeciesList[0]);
  });
});
