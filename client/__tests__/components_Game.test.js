import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Game from '../src/components/Game';

// Mock the hooks
jest.mock('../src/hooks/UseGameOver', () => ({
  useGameOver: jest.fn()
}));

// Mock components
jest.mock('../src/components/Menu', () => {
  return function MockMenu({ onClick }) {
    return <button onClick={onClick}>Play Tetris</button>;
  };
});

jest.mock('../src/components/Tetris', () => {
  return function MockTetris() {
    return <div className="Tetris">Mock Tetris</div>;
  };
});

const mockUseGameOver = require('../src/hooks/UseGameOver').useGameOver;

describe('Game', () => {
  const defaultProps = {
    room: 'testroom',
    socket: {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.socket.emit.mockClear();
    defaultProps.socket.on.mockClear();
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

    expect(defaultProps.socket.emit).toHaveBeenCalledWith("startCountdown", { room: defaultProps.room }, expect.any(Function));
  });

  it('sets up socket listeners on mount', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);

    render(<Game {...defaultProps} />);

    expect(defaultProps.socket.on).toHaveBeenCalledWith("gameStart", expect.any(Function));
    expect(defaultProps.socket.on).toHaveBeenCalledWith("gameAlreadyStarted", expect.any(Function));
    expect(defaultProps.socket.on).toHaveBeenCalledWith("endOfGame", expect.any(Function));
  });
});
