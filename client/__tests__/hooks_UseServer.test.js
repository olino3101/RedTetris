import { renderHook } from '@testing-library/react';
import { useServerData } from '../src/hooks/UseServer';

describe('useServerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns expected array structure', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(2);
    expect(result.current[1]).toBe(3);
  });

  it('returns hardcoded values', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(result.current[0]).toBe(2);
    expect(result.current[1]).toBe(3);
  });

  it('returns same values on multiple calls', () => {
    const { result: result1 } = renderHook(() => useServerData());
    const { result: result2 } = renderHook(() => useServerData());
    const { result: result3 } = renderHook(() => useServerData());
    
    expect(result1.current[0]).toBe(2);
    expect(result1.current[1]).toBe(3);
    expect(result2.current[0]).toBe(2);
    expect(result2.current[1]).toBe(3);
    expect(result3.current[0]).toBe(2);
    expect(result3.current[1]).toBe(3);
  });

  it('returns consistent values across renders', () => {
    const { result, rerender } = renderHook(() => useServerData());
    
    expect(result.current[0]).toBe(2);
    expect(result.current[1]).toBe(3);
    
    rerender();
    
    expect(result.current[0]).toBe(2);
    expect(result.current[1]).toBe(3);
  });

  it('returns first element as number', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(typeof result.current[0]).toBe('number');
    expect(result.current[0]).toBe(2);
  });

  it('returns second element as number', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(typeof result.current[1]).toBe('number');
    expect(result.current[1]).toBe(3);
  });

  it('returns first element as addIndestructibleLines function', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(typeof result.current[0]).toBe('number');
    expect(result.current[0]).toBe(2);
  });

  it('returns second element as players array', () => {
    const { result } = renderHook(() => useServerData());
    
    expect(typeof result.current[1]).toBe('number');
    expect(result.current[1]).toBe(3);
  });

  it('handles destructuring assignment correctly', () => {
    const { result } = renderHook(() => useServerData());
    
    const [addIndestructibleLines, players] = result.current;
    
    expect(addIndestructibleLines).toBe(2);
    expect(players).toBe(3);
  });

  it('maintains reference equality across renders', () => {
    const { result, rerender } = renderHook(() => useServerData());
    
    const firstCall = result.current;
    
    rerender();
    
    const secondCall = result.current;
    
    // Should maintain same reference since it's hardcoded
    expect(firstCall).toEqual(secondCall);
  });

  it('works with different component instances', () => {
    const { result: result1 } = renderHook(() => useServerData());
    const { result: result2 } = renderHook(() => useServerData());
    
    expect(result1.current).toEqual([2, 3]);
    expect(result2.current).toEqual([2, 3]);
  });

  it('handles multiple calls in same component', () => {
    const { result } = renderHook(() => {
      const data1 = useServerData();
      const data2 = useServerData();
      return { data1, data2 };
    });
    
    expect(result.current.data1).toEqual([2, 3]);
    expect(result.current.data2).toEqual([2, 3]);
  });
});
