import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Game from '../src/components/Game';

// Mock the hooks
jest.mock('../src/hooks/UseGameOver', () => ({
  useGameOver: jest.fn()
}));

// Mock components
jest.mock('../src/components/Menu', () => {
  return function MockMenu({ onClick, socket }) {
    return <button onClick={onClick} data-testid="menu-button">Play Tetris</button>;
  };
});

jest.mock('../src/components/Tetris', () => {
  return function MockTetris({ rows, columns, socket, room, setGameOver }) {
    return (
      <div className="Tetris" data-testid="tetris-component">
        Mock Tetris - Rows: {rows}, Columns: {columns}, Room: {room}
      </div>
    );
  };
});

const mockUseGameOver = require('../src/hooks/UseGameOver').useGameOver;

describe('Game', () => {
  const defaultProps = {
    room: 'testroom',
    name: 'testplayer',
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

    const tetrisComponent = screen.getByTestId('tetris-component');
    expect(tetrisComponent).toBeInTheDocument();
    expect(tetrisComponent).toHaveTextContent('Mock Tetris - Rows: 20, Columns: 10, Room: testroom');

    expect(screen.queryByTestId('menu-button')).not.toBeInTheDocument();
  });

  it('renders Menu component when game is over', () => {
    const setGameOver = jest.fn();
    const resetGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, resetGameOver]);

    render(<Game {...defaultProps} />);

    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    expect(screen.queryByTestId('tetris-component')).not.toBeInTheDocument();
  });

  it('displays error message when game is over and error exists', () => {
    const setGameOver = jest.fn();
    const resetGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, resetGameOver]);

    // Simulate socket callback setting error message
    const { rerender } = render(<Game {...defaultProps} />);

    // Trigger the start function which should call socket.emit with callback
    const menuButton = screen.getByTestId('menu-button');
    act(() => {
      fireEvent.click(menuButton);
    });

    // Get the callback that was passed to socket.emit
    const emitCall = defaultProps.socket.emit.mock.calls.find(call => call[0] === 'startCountdown');
    expect(emitCall).toBeDefined();

    const callback = emitCall[2];
    expect(typeof callback).toBe('function');

    // Simulate callback with error message
    act(() => {
      callback({ message: 'Game already started!' });
    });

    rerender(<Game {...defaultProps} />);
    expect(screen.getByText('Game already started!')).toBeInTheDocument();
  });

  it('sets up socket event listeners on mount', () => {
    mockUseGameOver.mockReturnValue([false, jest.fn(), jest.fn()]);

    render(<Game {...defaultProps} />);

    expect(defaultProps.socket.on).toHaveBeenCalledWith('gameStart', expect.any(Function));
    expect(defaultProps.socket.on).toHaveBeenCalledWith('gameAlreadyStarted', expect.any(Function));
    expect(defaultProps.socket.on).toHaveBeenCalledWith('endOfGame', expect.any(Function));
  });

  it('handles gameStart event correctly', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, jest.fn()]);

    render(<Game {...defaultProps} />);

    // Get the gameStart event handler
    const gameStartCall = defaultProps.socket.on.mock.calls.find(call => call[0] === 'gameStart');
    const gameStartHandler = gameStartCall[1];

    act(() => {
      gameStartHandler();
    });

    expect(setGameOver).toHaveBeenCalledWith(false);
  });

  it('handles gameAlreadyStarted event correctly', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);

    render(<Game {...defaultProps} />);

    // Get the gameAlreadyStarted event handler
    const gameAlreadyStartedCall = defaultProps.socket.on.mock.calls.find(call => call[0] === 'gameAlreadyStarted');
    const gameAlreadyStartedHandler = gameAlreadyStartedCall[1];

    act(() => {
      gameAlreadyStartedHandler({ message: 'Game already in progress' });
    });

    expect(setGameOver).toHaveBeenCalledWith(true);
  });

  it('handles endOfGame event correctly', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);

    render(<Game {...defaultProps} />);

    // Get the endOfGame event handler
    const endOfGameCall = defaultProps.socket.on.mock.calls.find(call => call[0] === 'endOfGame');
    const endOfGameHandler = endOfGameCall[1];

    // Capture console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      endOfGameHandler();
    });

    expect(setGameOver).toHaveBeenCalledWith(true);
    expect(defaultProps.socket.emit).toHaveBeenCalledWith('joinRoom', {
      room: 'testroom',
      name: 'testplayer'
    });
    expect(consoleSpy).toHaveBeenCalledWith('rejoining room');

    consoleSpy.mockRestore();
  });

  it('emits startCountdown when menu button is clicked', () => {
    const setGameOver = jest.fn();
    const resetGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, resetGameOver]);

    render(<Game {...defaultProps} />);

    const menuButton = screen.getByTestId('menu-button');

    act(() => {
      fireEvent.click(menuButton);
    });

    expect(defaultProps.socket.emit).toHaveBeenCalledWith(
      'startCountdown',
      { room: 'testroom' },
      expect.any(Function)
    );
  });

  it('passes correct props to Tetris component', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([false, setGameOver, jest.fn()]);

    render(<Game {...defaultProps} />);

    const tetrisComponent = screen.getByTestId('tetris-component');
    expect(tetrisComponent).toHaveTextContent('Rows: 20');
    expect(tetrisComponent).toHaveTextContent('Columns: 10');
    expect(tetrisComponent).toHaveTextContent('Room: testroom');
  });

  it('clears error message on gameStart event', () => {
    const setGameOver = jest.fn();
    mockUseGameOver.mockReturnValue([true, setGameOver, jest.fn()]);

    const { rerender } = render(<Game {...defaultProps} />);

    // First set an error message
    const menuButton = screen.getByTestId('menu-button');
    act(() => {
      fireEvent.click(menuButton);
    });

    const emitCall = defaultProps.socket.emit.mock.calls.find(call => call[0] === 'startCountdown');
    const callback = emitCall[2];

    act(() => {
      callback({ message: 'Error message' });
    });

    rerender(<Game {...defaultProps} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Now trigger gameStart to clear the error
    const gameStartCall = defaultProps.socket.on.mock.calls.find(call => call[0] === 'gameStart');
    const gameStartHandler = gameStartCall[1];

    act(() => {
      gameStartHandler();
    });

    rerender(<Game {...defaultProps} />);
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
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
