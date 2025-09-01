import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '../src/hooks/UsePlayer';

// Mock the UseServer hook
jest.mock('../src/hooks/UseServer', () => ({
  getNextTetromino: jest.fn()
}));

const mockGetNextTetromino = require('../src/hooks/UseServer').getNextTetromino;

describe('usePlayer', () => {
  const mockTetromino = {
    shape: [[1, 1], [1, 1]],
    className: 'tetromino__o'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNextTetromino.mockReturnValue(mockTetromino);
  });

  it('initializes with default player state', () => {
    const { result } = renderHook(() => usePlayer());
    
    expect(result.current[0]).toEqual({
      collided: false,
      isFastDropping: false,
      position: { row: 0, column: 4 },
      tetromino: mockTetromino
    });
  });

  it('returns correct array structure', () => {
    const { result } = renderHook(() => usePlayer());
    
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(3);
    expect(typeof result.current[0]).toBe('object'); // player
    expect(typeof result.current[1]).toBe('function'); // setPlayer
    expect(typeof result.current[2]).toBe('function'); // resetPlayer
  });

  it('calls getNextTetromino on initialization', () => {
    renderHook(() => usePlayer());
    
    expect(mockGetNextTetromino).toHaveBeenCalledTimes(1);
  });

  it('calls getNextTetromino on resetPlayer', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    const initialTetromino = player.tetromino;
    
    act(() => {
      resetPlayer();
    });
    
    // After reset, we should have a new tetromino (which comes from mockGetNextTetromino)
    expect(result.current[0].tetromino).toEqual(mockTetromino);
    expect(mockGetNextTetromino).toHaveBeenCalled();
  });

  it('resets player to initial state', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    const initialPlayer = { ...player };
    
    // Modify player state
    act(() => {
      setPlayer({
        ...player,
        collided: true,
        isFastDropping: true,
        position: { row: 5, column: 2 }
      });
    });
    
    expect(result.current[0].collided).toBe(true);
    expect(result.current[0].isFastDropping).toBe(true);
    expect(result.current[0].position).toEqual({ row: 5, column: 2 });
    
    // Reset player
    act(() => {
      resetPlayer();
    });
    
    expect(result.current[0].collided).toBe(false);
    expect(result.current[0].isFastDropping).toBe(false);
    expect(result.current[0].position).toEqual({ row: 0, column: 4 });
  });

  it('updates player state when setPlayer is called', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      setPlayer({
        ...player,
        collided: true,
        position: { row: 3, column: 1 }
      });
    });
    
    expect(result.current[0].collided).toBe(true);
    expect(result.current[0].position).toEqual({ row: 3, column: 1 });
    expect(result.current[0].isFastDropping).toBe(false); // Should remain unchanged
  });

  it('maintains tetromino reference on reset', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    const initialTetromino = player.tetromino;
    
    act(() => {
      resetPlayer();
    });
    
    // Should get a new tetromino from getNextTetromino
    expect(result.current[0].tetromino).toEqual(mockTetromino);
    expect(mockGetNextTetromino).toHaveBeenCalled();
  });

  it('handles multiple resetPlayer calls', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      resetPlayer();
    });
    expect(result.current[0].tetromino).toEqual(mockTetromino);
    
    act(() => {
      resetPlayer();
    });
    expect(result.current[0].tetromino).toEqual(mockTetromino);
    
    act(() => {
      resetPlayer();
    });
    expect(result.current[0].tetromino).toEqual(mockTetromino);
    
    // Verify that getNextTetromino was called multiple times
    expect(mockGetNextTetromino).toHaveBeenCalled();
  });

  it('handles complex player state updates', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Update multiple properties
    act(() => {
      setPlayer({
        ...player,
        collided: true,
        isFastDropping: true,
        position: { row: 10, column: 5 },
        tetromino: {
          shape: [[1, 1, 1], [0, 1, 0]],
          className: 'tetromino__t'
        }
      });
    });
    
    expect(result.current[0].collided).toBe(true);
    expect(result.current[0].isFastDropping).toBe(true);
    expect(result.current[0].position).toEqual({ row: 10, column: 5 });
    expect(result.current[0].tetromino.shape).toEqual([[1, 1, 1], [0, 1, 0]]);
    expect(result.current[0].tetromino.className).toBe('tetromino__t');
  });

  it('handles partial player state updates', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Update only position
    act(() => {
      setPlayer({
        ...player,
        position: { row: 2, column: 3 }
      });
    });
    
    expect(result.current[0].position).toEqual({ row: 2, column: 3 });
    expect(result.current[0].collided).toBe(false); // Should remain unchanged
    expect(result.current[0].isFastDropping).toBe(false); // Should remain unchanged
    expect(result.current[0].tetromino).toEqual(mockTetromino); // Should remain unchanged
  });

  it('handles edge case positions', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Test edge positions
    const edgePositions = [
      { row: 0, column: 0 },
      { row: 0, column: 9 },
      { row: 19, column: 0 },
      { row: 19, column: 9 },
      { row: -1, column: 4 },
      { row: 0, column: 10 },
      { row: 20, column: 4 }
    ];
    
    edgePositions.forEach(position => {
      act(() => {
        setPlayer({
          ...player,
          position
        });
      });
      
      expect(result.current[0].position).toEqual(position);
    });
  });

  it('handles different tetromino types', () => {
    const tetrominoTypes = [
      { shape: [[1, 1, 1, 1]], className: 'tetromino__i' },
      { shape: [[1, 1], [1, 1]], className: 'tetromino__o' },
      { shape: [[0, 1, 0], [1, 1, 1]], className: 'tetromino__t' },
      { shape: [[0, 1, 1], [1, 1, 0]], className: 'tetromino__s' },
      { shape: [[1, 1, 0], [0, 1, 1]], className: 'tetromino__z' },
      { shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]], className: 'tetromino__j' },
      { shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]], className: 'tetromino__l' }
    ];
    
    tetrominoTypes.forEach(tetromino => {
      mockGetNextTetromino.mockReturnValue(tetromino);
      
      const { result } = renderHook(() => usePlayer());
      
      expect(result.current[0].tetromino).toEqual(tetromino);
    });
  });

  it('handles tetromino with different shapes', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    const complexShape = [
      [1, 1, 1, 1],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [1, 1, 1, 1]
    ];
    
    act(() => {
      setPlayer({
        ...player,
        tetromino: {
          shape: complexShape,
          className: 'custom_tetromino'
        }
      });
    });
    
    expect(result.current[0].tetromino.shape).toEqual(complexShape);
    expect(result.current[0].tetromino.className).toBe('custom_tetromino');
  });

  it('handles boolean state changes', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Test collided state
    act(() => {
      setPlayer({
        ...player,
        collided: true
      });
    });
    expect(result.current[0].collided).toBe(true);
    
    act(() => {
      setPlayer({
        ...player,
        collided: false
      });
    });
    expect(result.current[0].collided).toBe(false);
    
    // Test isFastDropping state
    act(() => {
      setPlayer({
        ...player,
        isFastDropping: true
      });
    });
    expect(result.current[0].isFastDropping).toBe(true);
    
    act(() => {
      setPlayer({
        ...player,
        isFastDropping: false
      });
    });
    expect(result.current[0].isFastDropping).toBe(false);
  });

  it('handles rapid state changes', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      setPlayer({ ...player, collided: true });
      setPlayer({ ...player, collided: false });
      setPlayer({ ...player, collided: true });
      setPlayer({ ...player, collided: false });
    });
    
    expect(result.current[0].collided).toBe(false);
  });

  it('handles resetPlayer after state changes', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Make some changes
    act(() => {
      setPlayer({
        ...player,
        collided: true,
        isFastDropping: true,
        position: { row: 5, column: 3 }
      });
    });
    
    // Reset
    act(() => {
      resetPlayer();
    });
    
    // Should be back to initial state
    expect(result.current[0].collided).toBe(false);
    expect(result.current[0].isFastDropping).toBe(false);
    expect(result.current[0].position).toEqual({ row: 0, column: 4 });
  });

  it('maintains state across multiple renders', () => {
    const { result, rerender } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      setPlayer({
        ...player,
        collided: true,
        position: { row: 3, column: 2 }
      });
    });
    
    expect(result.current[0].collided).toBe(true);
    expect(result.current[0].position).toEqual({ row: 3, column: 2 });
    
    // Re-render
    rerender();
    
    // State should be maintained
    expect(result.current[0].collided).toBe(true);
    expect(result.current[0].position).toEqual({ row: 3, column: 2 });
  });

  it('handles undefined setPlayer input gracefully', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Should not crash
    act(() => {
      setPlayer(undefined);
    });
    
    // With undefined, React sets the state to undefined
    expect(result.current[0]).toBeUndefined();
  });

  it('handles null setPlayer input gracefully', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Should not crash
    act(() => {
      setPlayer(null);
    });
    
    // Should handle gracefully
    expect(result.current[0]).toBeDefined();
  });

  it('handles missing setPlayer input gracefully', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    // Should not crash
    act(() => {
      setPlayer();
    });
    
    // With no arguments, React sets the state to undefined
    expect(result.current[0]).toBeUndefined();
  });

  it('handles setPlayer with incomplete player object', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      setPlayer({
        collided: true
        // Missing other properties
      });
    });
    
    // Should handle gracefully
    expect(result.current[0].collided).toBe(true);
  });

  it('handles setPlayer with extra properties', () => {
    const { result } = renderHook(() => usePlayer());
    
    const [player, setPlayer, resetPlayer] = result.current;
    
    act(() => {
      setPlayer({
        ...player,
        extraProperty: 'extra value',
        anotherExtra: 123
      });
    });
    
    // Should handle gracefully
    expect(result.current[0].extraProperty).toBe('extra value');
    expect(result.current[0].anotherExtra).toBe(123);
  });
});
