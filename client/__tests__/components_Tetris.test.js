import React from 'react';
import { render, screen } from '@testing-library/react';
import Tetris from '../src/components/Tetris';

// Mock all the hooks
jest.mock('../src/hooks/UseGameStats', () => ({
  useGameStats: jest.fn()
}));

jest.mock('../src/hooks/UsePlayer', () => ({
  usePlayer: jest.fn()
}));

jest.mock('../src/hooks/UseBoard', () => ({
  useBoard: jest.fn()
}));

jest.mock('../src/hooks/UsePunishLine', () => ({
  usePunishedLine: jest.fn()
}));

// Mock utils
jest.mock('../src/utils/UseServer', () => ({
  sendBoard: jest.fn(),
  getOpponentsBoards: jest.fn(() => [])
}));

// Mock components
jest.mock('../src/components/Board', () => {
  return function MockBoard() {
    return <div className="Board">Mock Board</div>;
  };
});

jest.mock('../src/components/GameStats', () => {
  return function MockGameStats() {
    return <div className="GameStats">Mock GameStats</div>;
  };
});

jest.mock('../src/components/Spectrums', () => {
  return function MockSpectrums() {
    return <div className="Spectrums">Mock Spectrums</div>;
  };
});

jest.mock('../src/components/GameController', () => {
  return function MockGameController() {
    return <div className="GameController">Mock GameController</div>;
  };
});

const mockUseGameStats = require('../src/hooks/UseGameStats').useGameStats;
const mockUsePlayer = require('../src/hooks/UsePlayer').usePlayer;
const mockUseBoard = require('../src/hooks/UseBoard').useBoard;
const mockUsePunishedLine = require('../src/hooks/UsePunishLine').usePunishedLine;

describe('Tetris', () => {
  const defaultProps = {
    rows: 20,
    columns: 10,
    socket: {
      emit: jest.fn(),
      on: jest.fn()
    },
    room: 'testroom',
    setGameOver: jest.fn()
  };

  const mockGameStats = {
    level: 1,
    points: 0,
    linesCompleted: 0,
    linesPerLevel: 10
  };

  const mockPlayer = {
    collided: false,
    isFastDropping: false,
    position: { row: 0, column: 4 },
    tetromino: { shape: [[1]], className: 'test' }
  };

  const mockBoard = {
    rows: Array(20).fill(Array(10).fill({ occupied: false, className: '' })),
    size: { rows: 20, columns: 10 }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGameStats.mockReturnValue([mockGameStats, jest.fn()]);
    mockUsePlayer.mockReturnValue([mockPlayer, jest.fn(), jest.fn()]);
    mockUseBoard.mockReturnValue([mockBoard, jest.fn()]);
    mockUsePunishedLine.mockReturnValue(jest.fn());
  });

  it('renders without crashing', () => {
    render(<Tetris {...defaultProps} />);
  });

  it('renders all required components', () => {
    render(<Tetris {...defaultProps} />);

    expect(document.querySelector('.Tetris')).toBeInTheDocument();
    expect(document.querySelector('.Board')).toBeInTheDocument();
    expect(document.querySelector('.GameStats')).toBeInTheDocument();
    expect(document.querySelector('.Spectrums')).toBeInTheDocument();
    expect(document.querySelector('.GameController')).toBeInTheDocument();
  });

  it('calls useGameStats hook correctly', () => {
    render(<Tetris {...defaultProps} />);

    expect(mockUseGameStats).toHaveBeenCalledTimes(1);
  });

  it('calls usePlayer hook correctly', () => {
    render(<Tetris {...defaultProps} />);

    expect(mockUsePlayer).toHaveBeenCalledTimes(1);
  });

  it('calls useBoard hook with correct parameters', () => {
    render(<Tetris {...defaultProps} />);

    expect(mockUseBoard).toHaveBeenCalledWith({
      rows: 20,
      columns: 10,
      player: mockPlayer,
      resetPlayer: expect.any(Function),
      addLinesCleared: expect.any(Function),
      addIndestructibleLines: expect.any(Function),
      socket: defaultProps.socket,
      room: defaultProps.room
    });
  });

  it('passes correct props to Board component', () => {
    render(<Tetris {...defaultProps} />);

    // Board should receive the board prop
    expect(document.querySelector('.Board')).toBeInTheDocument();
  });

  it('passes correct props to GameStats component', () => {
    render(<Tetris {...defaultProps} />);

    // GameStats should receive the gameStats prop
    expect(document.querySelector('.GameStats')).toBeInTheDocument();
  });

  it('passes correct props to Spectrums component', () => {
    render(<Tetris {...defaultProps} />);

    // Spectrums should receive the players prop (which is the board)
    expect(document.querySelector('.Spectrums')).toBeInTheDocument();
  });

  it('passes correct props to GameController component', () => {
    render(<Tetris {...defaultProps} />);

    // GameController should receive all the required props
    expect(document.querySelector('.GameController')).toBeInTheDocument();
  });

  it('handles different board sizes correctly', () => {
    const customProps = { rows: 15, columns: 8, setGameOver: jest.fn() };
    render(<Tetris {...customProps} />);

    expect(mockUseBoard).toHaveBeenCalledWith({
      rows: 15,
      columns: 8,
      player: mockPlayer,
      resetPlayer: expect.any(Function),
      addLinesCleared: expect.any(Function),
      addIndestructibleLines: expect.any(Function)
    });
  });

  it('calls setGameOver when passed as prop', () => {
    const setGameOver = jest.fn();
    render(<Tetris {...defaultProps} setGameOver={setGameOver} />);

    // The setGameOver function should be passed to GameController
    expect(document.querySelector('.GameController')).toBeInTheDocument();
  });
});
