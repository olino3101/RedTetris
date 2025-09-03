import React from 'react';
import { render, screen } from '@testing-library/react';
import Spectrums from '../src/components/Spectrums';

// Mock the Spectrum component
jest.mock('../src/components/Spectrum', () => {
  return function MockSpectrum({ board, name }) {
    return <div data-testid={`spectrum-${name}`}>Mock Spectrum: {name}</div>;
  };
});

describe('Spectrums', () => {
  const defaultOpponents = new Map([
    ['player1', { rows: [[{ occupied: false, className: '' }]] }],
    ['player2', { rows: [[{ occupied: true, className: 'test' }]] }],
    ['player3', { rows: [[{ occupied: false, className: '' }]] }]
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Spectrums opponents={defaultOpponents} />);
  });

  it('renders "No opponents connected" when no opponents', () => {
    render(<Spectrums opponents={new Map()} />);
    expect(screen.getByText('No opponents connected')).toBeInTheDocument();
  });

  it('renders "No opponents connected" when opponents is null', () => {
    render(<Spectrums opponents={null} />);
    expect(screen.getByText('No opponents connected')).toBeInTheDocument();
  });

  it('renders "No opponents connected" when opponents is undefined', () => {
    render(<Spectrums opponents={undefined} />);
    expect(screen.getByText('No opponents connected')).toBeInTheDocument();
  });

  it('renders Spectrum components for each opponent', () => {
    render(<Spectrums opponents={defaultOpponents} />);

    expect(screen.getByTestId('spectrum-player1')).toBeInTheDocument();
    expect(screen.getByTestId('spectrum-player2')).toBeInTheDocument();
    expect(screen.getByTestId('spectrum-player3')).toBeInTheDocument();
  });

  it('passes correct props to Spectrum components', () => {
    render(<Spectrums opponents={defaultOpponents} />);

    expect(screen.getByText('Mock Spectrum: player1')).toBeInTheDocument();
    expect(screen.getByText('Mock Spectrum: player2')).toBeInTheDocument();
    expect(screen.getByText('Mock Spectrum: player3')).toBeInTheDocument();
  });

  it('handles single opponent', () => {
    const singleOpponent = new Map([
      ['player1', { rows: [[{ occupied: false, className: '' }]] }]
    ]);

    render(<Spectrums opponents={singleOpponent} />);

    expect(screen.getByTestId('spectrum-player1')).toBeInTheDocument();
    expect(screen.queryByText('No opponents connected')).not.toBeInTheDocument();
  });
});
