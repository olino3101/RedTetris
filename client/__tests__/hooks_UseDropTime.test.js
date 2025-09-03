import { renderHook, act } from '@testing-library/react';
import { useDropTime } from '../src/hooks/UseDropTime';

describe('useDropTime', () => {
  const defaultGameStats = { level: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: defaultGameStats }));

    expect(result.current[0]).toBe(400); // defaultDropTime
  });

  describe('useDropTime', () => {
    it('returns correct array structure', () => {
      const { result } = renderHook(() => useDropTime({ gameStats: { level: 1 } }));
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(3); // Not 4!
      expect(typeof result.current[0]).toBe('number'); // dropTime
      expect(typeof result.current[1]).toBe('function'); // pauseDropTime
      expect(typeof result.current[2]).toBe('function'); // resumeDropTime
    });
  });

  it('calculates drop time based on level', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 3 } }));

    // level 3: 400 - (50 * 2) = 300
    expect(result.current[0]).toBe(300);
  });

  it('calculates drop time for high level', () => {
    const gameStats = { level: 10 };
    const { result } = renderHook(() => useDropTime({ gameStats }));

    // level 10: 200 - (50 * 9) = 200 - 450 = -250, but minimum is 100
    expect(result.current[0]).toBe(100);
  });

  it('respects minimum drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 8 } }));

    // level 8: 400 - (50 * 7) = 400 - 350 = 50, but minimum is 100
    expect(result.current[0]).toBe(100);
  });

  it('handles level 1 correctly', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 1 } }));

    // level 1: 400 - (50 * 0) = 400
    expect(result.current[0]).toBe(400);
  });

  it('handles level 2 correctly', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 2 } }));

    // level 2: 400 - (50 * 1) = 350
    expect(result.current[0]).toBe(350);
  });


  it('handles resume without previous drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 1 } }));

    act(() => {
      result.current[2](); // resumeDropTime
    });

    // Should not change anything
    expect(result.current[0]).toBe(400);
  });

  it('updates drop time when level changes', () => {
    const { result, rerender } = renderHook(({ gameStats }) => useDropTime({ gameStats }), {
      initialProps: { gameStats: { level: 1 } }
    });

    // Initial level 1
    expect(result.current[0]).toBe(400);

    // Change to level 3
    rerender({ gameStats: { level: 3 } });
    expect(result.current[0]).toBe(300);
  });

  it('updates drop time when level increases', () => {
    const { result, rerender } = renderHook(({ gameStats }) => useDropTime({ gameStats }), {
      initialProps: { gameStats: { level: 1 } }
    });

    // Level 1
    expect(result.current[0]).toBe(400);

    // Level 2
    rerender({ gameStats: { level: 2 } });
    expect(result.current[0]).toBe(350);

    // Level 3
    rerender({ gameStats: { level: 3 } });
    expect(result.current[0]).toBe(300);
  });

  it('handles level 0 gracefully', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 0 } }));

    // level 0: 400 - (50 * -1) = 400 + 50 = 450
    expect(result.current[0]).toBe(450);
  });

  it('handles negative level gracefully', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: -5 } }));

    // level -5: 400 - (50 * -6) = 400 + 300 = 700
    expect(result.current[0]).toBe(700);
  });

  it('handles string level gracefully', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: "3" } }));

    // String "3" should be converted to number 3
    expect(result.current[0]).toBe(300);
  });

  it('handles very high level', () => {
    const gameStats = { level: 100 };
    const { result } = renderHook(() => useDropTime({ gameStats }));

    // Very high level should hit minimum drop time
    expect(result.current[0]).toBe(100);
  });

  it('handles edge case of level causing exact minimum drop time', () => {
    const { result } = renderHook(() => useDropTime({ gameStats: { level: 7 } }));

    // level 7: 400 - (50 * 6) = 400 - 300 = 100 (exactly at minimum)
    expect(result.current[0]).toBe(100);
  });
});
