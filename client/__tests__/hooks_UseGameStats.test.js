import { renderHook, act } from '@testing-library/react';
import { useGameStats } from '../src/hooks/UseGameStats';

describe('useGameStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default game stats', () => {
    const { result } = renderHook(() => useGameStats());
    
    expect(result.current[0]).toEqual({
      level: 1,
      linesCompleted: 0,
      linesPerLevel: 10,
      points: 0
    });
  });

  it('returns correct array structure', () => {
    const { result } = renderHook(() => useGameStats());
    
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
    expect(typeof result.current[0]).toBe('object'); // gameStats
    expect(typeof result.current[1]).toBe('function'); // addLinesCleared
  });

  it('adds lines cleared correctly', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.linesCompleted).toBe(0);
    expect(gameStats.points).toBe(0);
    
    act(() => {
      addLinesCleared(2);
    });
    
    expect(result.current[0].linesCompleted).toBe(2);
    expect(result.current[0].points).toBe(200);
  });

  it('adds multiple lines cleared correctly', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(1);
      addLinesCleared(2);
      addLinesCleared(1);
    });
    
    expect(result.current[0].linesCompleted).toBe(4);
    expect(result.current[0].points).toBe(400);
  });

  it('calculates points correctly (100 per line)', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(1);
    });
    expect(result.current[0].points).toBe(100);
    
    act(() => {
      addLinesCleared(3);
    });
    expect(result.current[0].points).toBe(400);
    
    act(() => {
      addLinesCleared(5);
    });
    expect(result.current[0].points).toBe(900);
  });

  it('levels up when lines completed reaches lines per level', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    
    act(() => {
      addLinesCleared(10);
    });
    
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(0);
  });

  it('levels up multiple times correctly', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    
    // Level up to level 2
    act(() => {
      addLinesCleared(10);
    });
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(0);
    
    // Level up to level 3
    act(() => {
      addLinesCleared(10);
    });
    expect(result.current[0].level).toBe(3);
    expect(result.current[0].linesCompleted).toBe(0);
  });

  it('handles partial level completion', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    expect(gameStats.linesCompleted).toBe(0);
    
    act(() => {
      addLinesCleared(3);
    });
    
    expect(result.current[0].level).toBe(1);
    expect(result.current[0].linesCompleted).toBe(3);
  });

  it('handles lines completed exceeding lines per level', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    expect(gameStats.linesCompleted).toBe(0);
    
    act(() => {
      addLinesCleared(15);
    });
    
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(5); // 15 % 10 = 5
  });

  it('handles multiple level ups in one call', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    
    act(() => {
      addLinesCleared(25);
    });
    
    expect(result.current[0].level).toBe(3);
    expect(result.current[0].linesCompleted).toBe(5); // 25 % 10 = 5
  });

  it('handles zero lines cleared', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    const initialStats = { ...gameStats };
    
    act(() => {
      addLinesCleared(0);
    });
    
    expect(result.current[0]).toEqual(initialStats);
  });

  it('handles negative lines cleared gracefully', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    const initialStats = { ...gameStats };
    
    act(() => {
      addLinesCleared(-5);
    });
    
    expect(result.current[0]).toEqual(initialStats);
  });

  it('handles decimal lines cleared gracefully', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    const initialStats = { ...gameStats };
    
    act(() => {
      addLinesCleared(2.7);
    });
    
    // Should handle decimal gracefully
    expect(result.current[0].linesCompleted).toBe(2);
    expect(result.current[0].points).toBe(200);
  });

  it('handles very large numbers of lines cleared', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(1000);
    });
    
    expect(result.current[0].level).toBe(101);
    expect(result.current[0].linesCompleted).toBe(0);
    expect(result.current[0].points).toBe(100000);
  });

  it('maintains lines per level constant', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.linesPerLevel).toBe(10);
    
    act(() => {
      addLinesCleared(15);
    });
    
    expect(result.current[0].linesPerLevel).toBe(10);
  });

  it('handles custom lines per level', () => {
    // This test would require modifying the hook to accept custom lines per level
    // For now, we test the default behavior
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.linesPerLevel).toBe(10);
  });

  it('handles edge case of exactly reaching lines per level', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    expect(gameStats.linesCompleted).toBe(0);
    
    act(() => {
      addLinesCleared(10);
    });
    
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(0);
  });

  it('handles edge case of one line short of level up', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    expect(gameStats.linesCompleted).toBe(0);
    
    act(() => {
      addLinesCleared(9);
    });
    
    expect(result.current[0].level).toBe(1);
    expect(result.current[0].linesCompleted).toBe(9);
  });

  it('handles edge case of one line over level up', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    expect(gameStats.level).toBe(1);
    expect(gameStats.linesCompleted).toBe(0);
    
    act(() => {
      addLinesCleared(11);
    });
    
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(1);
  });

  it('handles multiple rapid calls to addLinesCleared', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(1);
      addLinesCleared(1);
      addLinesCleared(1);
      addLinesCleared(1);
    });
    
    expect(result.current[0].linesCompleted).toBe(4);
    expect(result.current[0].points).toBe(400);
  });

  it('handles complex line clearing scenarios', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    // Clear 7 lines (should not level up)
    act(() => {
      addLinesCleared(7);
    });
    expect(result.current[0].level).toBe(1);
    expect(result.current[0].linesCompleted).toBe(7);
    expect(result.current[0].points).toBe(700);
    
    // Clear 5 more lines (should level up: 7 + 5 = 12, level 2 with 2 remaining)
    act(() => {
      addLinesCleared(5);
    });
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].linesCompleted).toBe(2);
    expect(result.current[0].points).toBe(1200);
    
    // Clear 8 more lines (should level up: 2 + 8 = 10, level 3 with 0 remaining)
    act(() => {
      addLinesCleared(8);
    });
    expect(result.current[0].level).toBe(3);
    expect(result.current[0].linesCompleted).toBe(0);
    expect(result.current[0].points).toBe(2000);
  });

  it('maintains state across multiple renders', () => {
    const { result, rerender } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(5);
    });
    
    expect(result.current[0].linesCompleted).toBe(5);
    expect(result.current[0].points).toBe(500);
    
    // Re-render
    rerender();
    
    // State should be maintained
    expect(result.current[0].linesCompleted).toBe(5);
    expect(result.current[0].points).toBe(500);
  });

  it('handles string input gracefully', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared("3");
    });
    
    // Should handle string input gracefully
    expect(result.current[0].linesCompleted).toBe(3);
    expect(result.current[0].points).toBe(300);
  });

  it('handles boolean input gracefully', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    
    act(() => {
      addLinesCleared(true);
    });
    
    // Should handle boolean input gracefully
    expect(result.current[0].linesCompleted).toBe(1);
    expect(result.current[0].points).toBe(100);
    
    act(() => {
      addLinesCleared(false);
    });
    
    // Should handle false gracefully
    expect(result.current[0].linesCompleted).toBe(1);
    expect(result.current[0].points).toBe(100);
  });

  it('handles undefined and null input gracefully', () => {
    const { result } = renderHook(() => useGameStats());
    
    const [gameStats, addLinesCleared] = result.current;
    const initialStats = { ...gameStats };
    
    act(() => {
      addLinesCleared(undefined);
    });
    
    expect(result.current[0]).toEqual(initialStats);
    
    act(() => {
      addLinesCleared(null);
    });
    
    expect(result.current[0]).toEqual(initialStats);
  });
});
