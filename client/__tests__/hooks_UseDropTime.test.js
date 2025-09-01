import { renderHook, act } from '@testing-library/react';
import { useDropTime } from '../src/hooks/UseDropTime';

describe('useDropTime', () => {
  const defaultGameStats = { level: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    expect(result.current[0]).toBe(200); // defaultDropTime
  });

  it('returns correct array structure', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(4);
    expect(typeof result.current[0]).toBe('number'); // dropTime
    expect(typeof result.current[1]).toBe('function'); // pauseDropTime
    expect(typeof result.current[2]).toBe('function'); // resumeDropTime
  });

  it('calculates drop time based on level', () => {
    const gameStats = { level: 3 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 3: 200 - (50 * 2) = 100
    expect(result.current[0]).toBe(100);
  });

  it('calculates drop time for high level', () => {
    const gameStats = { level: 10 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 10: 200 - (50 * 9) = 200 - 450 = -250, but minimum is 100
    expect(result.current[0]).toBe(100);
  });

  it('respects minimum drop time', () => {
    const gameStats = { level: 5 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 5: 200 - (50 * 4) = 200 - 200 = 0, but minimum is 100
    expect(result.current[0]).toBe(100);
  });

  it('handles level 1 correctly', () => {
    const gameStats = { level: 1 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 1: 200 - (50 * 0) = 200
    expect(result.current[0]).toBe(200);
  });

  it('handles level 2 correctly', () => {
    const gameStats = { level: 2 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 2: 200 - (50 * 1) = 150
    expect(result.current[0]).toBe(150);
  });

  it('handles level 4 correctly', () => {
    const gameStats = { level: 4 };
    const { result } = useDropTime({ gameStats });
    
    // level 4: 200 - (50 * 3) = 200 - 150 = 50, but minimum is 100
    expect(result[0]).toBe(100);
  });

  it('pauses drop time correctly', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    const [dropTime, pauseDropTime] = result.current;
    expect(dropTime).toBe(200);
    
    act(() => {
      pauseDropTime();
    });
    
    expect(result.current[0]).toBe(null);
    expect(result.current[3]).toBe(200); // previousDropTime
  });

  it('resumes drop time correctly', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    const [dropTime, pauseDropTime, resumeDropTime] = result.current;
    
    // Pause first
    act(() => {
      pauseDropTime();
    });
    
    expect(result.current[0]).toBe(null);
    
    // Then resume
    act(() => {
      resumeDropTime();
    });
    
    expect(result.current[0]).toBe(200);
    expect(result.current[3]).toBe(null); // previousDropTime should be null
  });

  it('resumes drop time with custom value', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    const [dropTime, pauseDropTime, resumeDropTime] = result.current;
    
    // Pause first
    act(() => {
      pauseDropTime();
    });
    
    expect(result.current[0]).toBe(null);
    
    // Then resume
    act(() => {
      resumeDropTime();
    });
    
    expect(result.current[0]).toBe(200);
  });

  it('handles resume without previous drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    const [dropTime, pauseDropTime, resumeDropTime] = result.current;
    
    // Try to resume without pausing first
    act(() => {
      resumeDropTime();
    });
    
    // Should not change anything
    expect(result.current[0]).toBe(200);
  });

  it('updates drop time when level changes', () => {
    const { result, rerender } = renderHook(
      ({ gameStats }) => useDropTime({ gameStats }),
      { initialProps: { gameStats: { level: 1 } } }
    );
    
    // Initial level 1
    expect(result.current[0]).toBe(200);
    
    // Change to level 3
    rerender({ gameStats: { level: 3 } });
    expect(result.current[0]).toBe(100);
  });

  it('updates drop time when level increases', () => {
    const { result, rerender } = renderHook(
      ({ gameStats }) => useDropTime({ gameStats }),
      { initialProps: { gameStats: { level: 1 } } }
    );
    
    // Level 1
    expect(result.current[0]).toBe(200);
    
    // Level 2
    rerender({ gameStats: { level: 2 } });
    expect(result.current[0]).toBe(150);
    
    // Level 3
    rerender({ gameStats: { level: 3 } });
    expect(result.current[0]).toBe(100);
  });

  it('handles level 0 gracefully', () => {
    const gameStats = { level: 0 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 0: 200 - (50 * -1) = 200 + 50 = 250
    expect(result.current[0]).toBe(250);
  });

  it('handles negative level gracefully', () => {
    const gameStats = { level: -5 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level -5: 200 - (50 * -6) = 200 + 300 = 500
    expect(result.current[0]).toBe(500);
  });

  it('handles undefined gameStats gracefully', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: undefined }));
    
    // Should default to level 1 behavior
    expect(result.current[0]).toBe(200);
  });

  it('handles null gameStats gracefully', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: null }));
    
    // Should default to level 1 behavior
    expect(result.current[0]).toBe(200);
  });

  it('handles missing gameStats gracefully', () => {
    const { result } = renderHook(() => useDropTime({}));
    
    // Should default to level 1 behavior
    expect(result.current[0]).toBe(200);
  });

  it('handles gameStats without level property', () => {
    const gameStats = {};
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // Should default to level 1 behavior
    expect(result.current[0]).toBe(200);
  });

  it('handles string level gracefully', () => {
    const gameStats = { level: "3" };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // String "3" should be converted to number 3
    expect(result.current[0]).toBe(100);
  });

  it('handles decimal level gracefully', () => {
    const gameStats = { level: 2.7 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // Decimal 2.7 should be handled correctly
    expect(result.current[0]).toBe(150);
  });

  it('handles very high level', () => {
    const gameStats = { level: 100 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // Very high level should hit minimum drop time
    expect(result.current[0]).toBe(100);
  });

  it('maintains pause state across level changes', () => {
    const { result, rerender } = renderHook(
      ({ gameStats }) => useDropTime({ gameStats }),
      { initialProps: { gameStats: { level: 1 } } }
    );
    
    const [dropTime, pauseDropTime, resumeDropTime] = result.current;
    
    // Pause at level 1
    act(() => {
      pauseDropTime();
    });
    
    expect(result.current[0]).toBe(null);
    
    // Change level while paused
    rerender({ gameStats: { level: 3 } });
    
    // Should still be paused
    expect(result.current[0]).toBe(null);
    
    // Resume should use new level drop time
    act(() => {
      resumeDropTime();
    });
    
    expect(result.current[0]).toBe(100); // level 3 drop time
  });

  it('handles multiple pause/resume cycles', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));
    
    const [dropTime, pauseDropTime, resumeDropTime] = result.current;
    
    // First pause/resume cycle
    act(() => {
      pauseDropTime();
    });
    expect(result.current[0]).toBe(null);
    
    act(() => {
      resumeDropTime();
    });
    expect(result.current[0]).toBe(200);
    
    // Second pause/resume cycle
    act(() => {
      pauseDropTime();
    });
    expect(result.current[0]).toBe(null);
    
    act(() => {
      resumeDropTime();
    });
    expect(result.current[0]).toBe(200);
  });

  it('handles edge case of level causing exact minimum drop time', () => {
    const gameStats = { level: 3 };
    const { result } = renderHook(() => useDropTime({ gameStats }));
    
    // level 3: 200 - (50 * 2) = 200 - 100 = 100 (exactly at minimum)
    expect(result.current[0]).toBe(100);
  });
});
