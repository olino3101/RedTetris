import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '../src/hooks/UsePlayer';

// Mock the UseServer hook
jest.mock('../src/utils/UseServer', () => ({
  getNextTetromino: jest.fn()
}));

const mockGetNextTetromino = require('../src/utils/UseServer').getNextTetromino;

describe('usePlayer', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn()
  };
  const mockRoom = 'testroom';

  const mockTetromino = {
    shape: [[1, 1], [1, 1]],
    className: 'tetromino__o'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNextTetromino.mockResolvedValue(mockTetromino);
  });

  it('initializes with null player state initially', () => {
    const { result } = renderHook(() => usePlayer(mockSocket, mockRoom));

    expect(result.current[0]).toBeNull();
  });

  it('returns correct array structure', () => {
    const { result } = renderHook(() => usePlayer(mockSocket, mockRoom));

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(3);
    expect(typeof result.current[1]).toBe('function'); // setPlayer
    expect(typeof result.current[2]).toBe('function'); // resetPlayer
  });

  it('calls getNextTetromino when socket and room are provided', async () => {
    renderHook(() => usePlayer(mockSocket, mockRoom));

    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockGetNextTetromino).toHaveBeenCalledWith(mockSocket, mockRoom);
  });

  it('calls getNextTetromino on resetPlayer', async () => {
    const { result } = renderHook(() => usePlayer(mockSocket, mockRoom));

    await act(async () => {
      await result.current[2](); // Call resetPlayer
    });

    expect(mockGetNextTetromino).toHaveBeenCalledWith(mockSocket, mockRoom);
  });

  it('does not initialize player when socket or room are missing', () => {
    const { result } = renderHook(() => usePlayer(null, mockRoom));

    expect(result.current[0]).toBeNull();
    expect(mockGetNextTetromino).not.toHaveBeenCalled();
  });

  it('updates player state when setPlayer is called', async () => {
    const { result } = renderHook(() => usePlayer(mockSocket, mockRoom));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const newPlayer = {
      collided: true,
      isFastDropping: true,
      position: { row: 5, column: 2 },
      tetromino: mockTetromino
    };

    act(() => {
      result.current[1](newPlayer);
    });

    expect(result.current[0]).toEqual(newPlayer);
  });
});
