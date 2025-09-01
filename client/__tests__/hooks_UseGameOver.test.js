import { renderHook, act } from '@testing-library/react';
import { useGameOver } from '../src/hooks/UseGameOver';

describe('useGameOver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with gameOver set to true', () => {
    const { result } = renderHook(() => useGameOver());
    
    expect(result.current[0]).toBe(true);
  });

  it('returns correct array structure', () => {
    const { result } = renderHook(() => useGameOver());
    
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(3);
    expect(typeof result.current[0]).toBe('boolean'); // gameOver
    expect(typeof result.current[1]).toBe('function'); // setGameOver
    expect(typeof result.current[2]).toBe('function'); // resetGameOver
  });

  it('sets gameOver to true when setGameOver is called with true', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    act(() => {
      setGameOver(true);
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('sets gameOver to false when setGameOver is called with false', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    act(() => {
      setGameOver(false);
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('resets gameOver to false when resetGameOver is called', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // First set to false
    act(() => {
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
    
    // Then reset
    act(() => {
      resetGameOver();
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('resets gameOver to false from true state', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Reset from true state
    act(() => {
      resetGameOver();
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('handles multiple setGameOver calls', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Set to false
    act(() => {
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
    
    // Set to true
    act(() => {
      setGameOver(true);
    });
    expect(result.current[0]).toBe(true);
    
    // Set to false again
    act(() => {
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
  });

  it('handles multiple resetGameOver calls', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // First reset
    act(() => {
      resetGameOver();
    });
    expect(result.current[0]).toBe(false);
    
    // Second reset
    act(() => {
      resetGameOver();
    });
    expect(result.current[0]).toBe(false);
    
    // Third reset
    act(() => {
      resetGameOver();
    });
    expect(result.current[0]).toBe(false);
  });

  it('handles setGameOver with different boolean values', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with explicit true
    act(() => {
      setGameOver(true);
    });
    expect(result.current[0]).toBe(true);
    
    // Test with explicit false
    act(() => {
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
  });

  it('handles setGameOver with truthy values', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with truthy values
    act(() => {
      setGameOver(1);
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver("hello");
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver({});
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver([]);
    });
    expect(result.current[0]).toBe(true);
  });

  it('handles setGameOver with falsy values', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with falsy values
    act(() => {
      setGameOver(0);
    });
    expect(result.current[0]).toBe(false);
    
    act(() => {
      setGameOver("");
    });
    expect(result.current[0]).toBe(false);
    
    act(() => {
      setGameOver(null);
    });
    expect(result.current[0]).toBe(false);
    
    act(() => {
      setGameOver(undefined);
    });
    expect(result.current[0]).toBe(false);
  });

  it('handles setGameOver with complex objects', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with complex objects
    const complexObject = { gameState: 'over', score: 1000 };
    act(() => {
      setGameOver(complexObject);
    });
    expect(result.current[0]).toBe(true);
    
    const emptyObject = {};
    act(() => {
      setGameOver(emptyObject);
    });
    expect(result.current[0]).toBe(true);
  });

  it('handles setGameOver with arrays', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with arrays
    const emptyArray = [];
    act(() => {
      setGameOver(emptyArray);
    });
    expect(result.current[0]).toBe(true);
    
    const populatedArray = [1, 2, 3];
    act(() => {
      setGameOver(populatedArray);
    });
    expect(result.current[0]).toBe(true);
  });

  it('handles setGameOver with functions', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with functions
    const testFunction = () => {};
    act(() => {
      setGameOver(testFunction);
    });
    expect(result.current[0]).toBe(true);
    
    const arrowFunction = () => true;
    act(() => {
      setGameOver(arrowFunction);
    });
    expect(result.current[0]).toBe(true);
  });

  it('handles setGameOver with numbers', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with numbers
    act(() => {
      setGameOver(0);
    });
    expect(result.current[0]).toBe(false);
    
    act(() => {
      setGameOver(1);
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver(-1);
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver(100);
    });
    expect(result.current[0]).toBe(true);
  });

  it('handles setGameOver with strings', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Test with strings
    act(() => {
      setGameOver("");
    });
    expect(result.current[0]).toBe(false);
    
    act(() => {
      setGameOver("false");
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver("true");
    });
    expect(result.current[0]).toBe(true);
    
    act(() => {
      setGameOver("game over");
    });
    expect(result.current[0]).toBe(true);
  });

  it('maintains state across multiple renders', () => {
    const { result, rerender } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Set to false
    act(() => {
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
    
    // Re-render
    rerender();
    
    // State should be maintained
    expect(result.current[0]).toBe(false);
  });

  it('handles rapid state changes', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Rapid changes
    act(() => {
      setGameOver(false);
      setGameOver(true);
      setGameOver(false);
      setGameOver(true);
    });
    
    // Should end up with the last value
    expect(result.current[0]).toBe(true);
  });

  it('handles resetGameOver after multiple state changes', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver, resetGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Multiple state changes
    act(() => {
      setGameOver(false);
      setGameOver(true);
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
    
    // Reset
    act(() => {
      resetGameOver();
    });
    expect(result.current[0]).toBe(false);
  });

  it('handles edge case of setting same value multiple times', () => {
    const { result } = renderHook(() => useGameOver());
    
    const [gameOver, setGameOver] = result.current;
    expect(gameOver).toBe(true);
    
    // Set to true multiple times
    act(() => {
      setGameOver(true);
      setGameOver(true);
      setGameOver(true);
    });
    expect(result.current[0]).toBe(true);
    
    // Set to false multiple times
    act(() => {
      setGameOver(false);
      setGameOver(false);
      setGameOver(false);
    });
    expect(result.current[0]).toBe(false);
  });
});
