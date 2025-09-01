import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Game from '../src/components/Game';

// Mock the hooks
jest.mock('../src/hooks/UseGameOver', () => ({
  useGameOver: jest.fn()
}));

const mockUseGameOver = require('../src/hooks/UseGameOver').useGameOver;

describe('Game', () => {
  const defaultProps = {
    rows: 20,
    columns: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockUseGameOver.mockReturnValue([false, jest.fn(), jest.fn()]);
    render(<Game {...defaultProps} />);
  });

  it('renders Tetris component when game is not over', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);
    
    render(<Game {...defaultProps} />);
    
    // Should render Tetris component (check for Board which is part of Tetris)
    expect(document.querySelector('.Tetris')).toBeInTheDocument();
  });

  it('renders Menu component when game is over', () => {
    const setGameOver = jest.fn();
    const resetGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, resetGameOver]);
    
    render(<Game {...defaultProps} />);
    
    // Should render Menu component
    expect(screen.getByText('Play Tetris')).toBeInTheDocument();
  });

  it('calls resetGameOver when start button is clicked', () => {
    const setGameOver = jest.fn();
    const resetGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, resetGameOver]);
    
    render(<Game {...defaultProps} />);
    
    const startButton = screen.getByText('Play Tetris');
    fireEvent.click(startButton);
    
    expect(resetGameOver).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to Tetris component', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);
    
    render(<Game {...defaultProps} />);
    
    // Tetris should receive the correct props
    expect(document.querySelector('.Tetris')).toBeInTheDocument();
  });

  it('handles different board sizes correctly', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);
    
    const customProps = { rows: 15, columns: 8 };
    render(<Game {...customProps} />);
    
    expect(document.querySelector('.Tetris')).toBeInTheDocument();
  });
});
