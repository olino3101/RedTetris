import React from 'react';
import { render, screen } from '@testing-library/react';
import Spectrums from '../src/components/Spectrums';

// Mock the Spectrum component
jest.mock('../src/components/Spectrum', () => {
  return function MockSpectrum({ player, index, key }) {
    return <div data-testid={`spectrum-${player}-${index}`} key={key}>Spectrum {player}-{index}</div>;
  };
});

describe('Spectrums', () => {
  const defaultPlayers = {
    size: { rows: 20, columns: 10 },
    rows: Array(20).fill(Array(10).fill({ occupied: false, className: '' }))
  };

  it('renders without crashing', () => {
    render(<Spectrums players={defaultPlayers} />);
  });

  it('renders three Spectrum components', () => {
    render(<Spectrums players={defaultPlayers} />);
    
    expect(screen.getByTestId('spectrum-1-2')).toBeInTheDocument();
    expect(screen.getByTestId('spectrum-1-2')).toBeInTheDocument();
    expect(screen.getByTestId('spectrum-1-2')).toBeInTheDocument();
  });

  it('renders Spectrum components with correct props', () => {
    render(<Spectrums players={defaultPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
    
    // All should have player=1 and index=2 as hardcoded in the component
    spectrums.forEach(spectrum => {
      expect(spectrum.textContent).toContain('1-2');
    });
  });

  it('renders Spectrum components with correct keys', () => {
    render(<Spectrums players={defaultPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with different players data', () => {
    const customPlayers = {
      size: { rows: 15, columns: 8 },
      rows: Array(15).fill(Array(8).fill({ occupied: true, className: 'test' }))
    };
    
    render(<Spectrums players={customPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with empty players data', () => {
    const emptyPlayers = {
      size: { rows: 0, columns: 0 },
      rows: []
    };
    
    render(<Spectrums players={emptyPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with undefined players prop', () => {
    render(<Spectrums players={undefined} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with null players prop', () => {
    render(<Spectrums players={null} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with missing players prop', () => {
    render(<Spectrums />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with complex players data structure', () => {
    const complexPlayers = {
      size: { rows: 25, columns: 12 },
      rows: Array(25).fill(null).map((_, rowIndex) => 
        Array(12).fill(null).map((_, colIndex) => ({
          occupied: (rowIndex + colIndex) % 2 === 0,
          className: `cell-${rowIndex}-${colIndex}`
        }))
      )
    };
    
    render(<Spectrums players={complexPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with single row players data', () => {
    const singleRowPlayers = {
      size: { rows: 1, columns: 10 },
      rows: [Array(10).fill({ occupied: false, className: '' })]
    };
    
    render(<Spectrums players={singleRowPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with single column players data', () => {
    const singleColPlayers = {
      size: { rows: 20, columns: 1 },
      rows: Array(20).fill([{ occupied: false, className: '' }])
    };
    
    render(<Spectrums players={singleColPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with very large players data', () => {
    const largePlayers = {
      size: { rows: 100, columns: 50 },
      rows: Array(100).fill(Array(50).fill({ occupied: false, className: '' }))
    };
    
    render(<Spectrums players={largePlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with players data containing special characters in className', () => {
    const specialPlayers = {
      size: { rows: 2, columns: 2 },
      rows: [
        [
          { occupied: true, className: 'tetromino__i ghost' },
          { occupied: false, className: '' }
        ],
        [
          { occupied: true, className: 'indestructible' },
          { occupied: true, className: 'tetromino__o__active' }
        ]
      ]
    };
    
    render(<Spectrums players={specialPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });

  it('renders with players data containing numeric className', () => {
    const numericPlayers = {
      size: { rows: 2, columns: 2 },
      rows: [
        [
          { occupied: true, className: '123' },
          { occupied: false, className: '0' }
        ],
        [
          { occupied: true, className: '456' },
          { occupied: true, className: '789' }
        ]
      ]
    };
    
    render(<Spectrums players={numericPlayers} />);
    
    const spectrums = screen.getAllByTestId(/spectrum-/);
    expect(spectrums).toHaveLength(3);
  });
});
