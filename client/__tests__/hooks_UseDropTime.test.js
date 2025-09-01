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

  it('handles string level gracefully', () => {
    const gameStats = { level: "3" };
    const { result } = renderHook(() => useDropTime({ gameStats }));

    // String "3" should be converted to number 3
    expect(result.current[0]).toBe(100);
  });

  it('handles very high level', () => {
    const gameStats = { level: 100 };
    const { result } = renderHook(() => useDropTime({ gameStats }));

    // Very high level should hit minimum drop time
    expect(result.current[0]).toBe(100);
  });

  it('handles edge case of level causing exact minimum drop time', () => {
    const gameStats = { level: 3 };
    const { result } = renderHook(() => useDropTime({ gameStats }));

    // level 3: 200 - (50 * 2) = 200 - 100 = 100 (exactly at minimum)
    expect(result.current[0]).toBe(100);
  });
});
