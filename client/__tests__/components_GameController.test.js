import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameController from '../src/components/GameController';

// Mock the hooks and utilities
jest.mock('../src/hooks/UseInterval', () => ({
  useInterval: jest.fn()
}));

jest.mock('../src/hooks/UseDropTime', () => ({
  useDropTime: jest.fn()
}));

jest.mock('../src/utils/Input', () => ({
  Action: {
    Left: "Left",
    FastDrop: "FastDrop",
    Pause: "Pause",
    Quit: "Quit",
    Right: "Right",
    Rotate: "Rotate",
    SlowDrop: "SlowDrop"
  },
  actionForKey: jest.fn(),
  actionIsDrop: jest.fn()
}));

jest.mock('../src/utils/PlayerController', () => ({
  playerController: jest.fn()
}));

const mockUseInterval = require('../src/hooks/UseInterval').useInterval;
const mockUseDropTime = require('../src/hooks/UseDropTime').useDropTime;
const mockActionForKey = require('../src/utils/Input').actionForKey;
const mockActionIsDrop = require('../src/utils/Input').actionIsDrop;
const mockPlayerController = require('../src/utils/PlayerController').playerController;

describe('GameController', () => {
  const defaultProps = {
    board: { rows: [], size: { rows: 20, columns: 10 } },
    gameStats: { level: 1 },
    player: { position: { row: 0, column: 4 }, tetromino: { shape: [[1]] } },
    setGameOver: jest.fn(),
    setPlayer: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDropTime.mockReturnValue([1000, jest.fn(), jest.fn(), jest.fn()]);
    mockUseInterval.mockImplementation((callback, delay) => {
      if (delay) {
        callback();
      }
    });
  });

  it('renders without crashing', () => {
    render(<GameController {...defaultProps} />);
  });

  it('renders input element with correct class', () => {
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.tagName).toBe('INPUT');
  });

  it('calls useDropTime hook with correct parameters', () => {
    render(<GameController {...defaultProps} />);
    
    expect(mockUseDropTime).toHaveBeenCalledWith({ gameStats: defaultProps.gameStats });
  });

  it('calls useInterval hook with correct parameters', () => {
    render(<GameController {...defaultProps} />);
    
    expect(mockUseInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('handles key down events correctly', () => {
    mockActionForKey.mockReturnValue('Left');
    mockActionIsDrop.mockReturnValue(false);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'ArrowLeft' });
    
    expect(mockActionForKey).toHaveBeenCalledWith('ArrowLeft');
    expect(mockPlayerController).toHaveBeenCalledWith({
      action: 'Left',
      board: defaultProps.board,
      player: defaultProps.player,
      setPlayer: defaultProps.setPlayer,
      setGameOver: defaultProps.setGameOver
    });
  });

  it('handles pause action correctly when dropTime exists', () => {
    const pauseDropTime = jest.fn();
    mockUseDropTime.mockReturnValue([1000, pauseDropTime, jest.fn(), jest.fn()]);
    mockActionForKey.mockReturnValue('Pause');
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'KeyP' });
    
    expect(pauseDropTime).toHaveBeenCalled();
  });

  it('handles pause action correctly when dropTime is null', () => {
    const resumeDropTime = jest.fn();
    mockUseDropTime.mockReturnValue([null, jest.fn(), resumeDropTime, jest.fn()]);
    mockActionForKey.mockReturnValue('Pause');
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'KeyP' });
    
    expect(resumeDropTime).toHaveBeenCalled();
  });

  it('handles quit action correctly', () => {
    mockActionForKey.mockReturnValue('Quit');
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'KeyQ' });
    
    expect(defaultProps.setGameOver).toHaveBeenCalledWith(true);
  });

  it('handles drop actions correctly', () => {
    mockActionForKey.mockReturnValue('SlowDrop');
    mockActionIsDrop.mockReturnValue(true);
    const pauseDropTime = jest.fn();
    mockUseDropTime.mockReturnValue([1000, pauseDropTime, jest.fn(), jest.fn()]);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'ArrowDown' });
    
    expect(pauseDropTime).toHaveBeenCalled();
    expect(mockPlayerController).toHaveBeenCalledWith({
      action: 'SlowDrop',
      board: defaultProps.board,
      player: defaultProps.player,
      setPlayer: defaultProps.setPlayer,
      setGameOver: defaultProps.setGameOver
    });
  });

  it('handles key up events for drop actions', () => {
    mockActionForKey.mockReturnValue('SlowDrop');
    mockActionIsDrop.mockReturnValue(true);
    const resumeDropTime = jest.fn();
    mockUseDropTime.mockReturnValue([1000, jest.fn(), resumeDropTime, jest.fn()]);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyUp(inputElement, { code: 'ArrowDown' });
    
    expect(resumeDropTime).toHaveBeenCalled();
  });

  it('handles non-drop actions correctly', () => {
    mockActionForKey.mockReturnValue('Left');
    mockActionIsDrop.mockReturnValue(false);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'ArrowLeft' });
    
    expect(mockPlayerController).toHaveBeenCalledWith({
      action: 'Left',
      board: defaultProps.board,
      player: defaultProps.player,
      setPlayer: defaultProps.setPlayer,
      setGameOver: defaultProps.setGameOver
    });
  });

  it('handles undefined action gracefully', () => {
    mockActionForKey.mockReturnValue(undefined);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'InvalidKey' });
    
    expect(mockPlayerController).not.toHaveBeenCalled();
  });

  it('calls handleInput with correct parameters', () => {
    mockActionForKey.mockReturnValue('Rotate');
    mockActionIsDrop.mockReturnValue(false);
    
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    fireEvent.keyDown(inputElement, { code: 'ArrowUp' });
    
    expect(mockPlayerController).toHaveBeenCalledWith({
      action: 'Rotate',
      board: defaultProps.board,
      player: defaultProps.player,
      setPlayer: defaultProps.setPlayer,
      setGameOver: defaultProps.setGameOver
    });
  });

  it('handles autoFocus correctly', () => {
    render(<GameController {...defaultProps} />);
    
    const inputElement = document.querySelector('.GameController');
    expect(inputElement).toHaveAttribute('autoFocus');
  });

  it('handles different game stats correctly', () => {
    const customGameStats = { level: 5 };
    mockUseDropTime.mockReturnValue([500, jest.fn(), jest.fn(), jest.fn()]);
    
    render(<GameController {...defaultProps} gameStats={customGameStats} />);
    
    expect(mockUseDropTime).toHaveBeenCalledWith({ gameStats: customGameStats });
  });
});
