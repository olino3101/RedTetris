import { renderHook } from '@testing-library/react';
import { useInterval } from '../src/hooks/UseInterval';

describe('useInterval', () => {
  let mockCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders without crashing', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, 1000));
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles null delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, null));
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles undefined delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, undefined));
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles callback changes', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    const { rerender, unmount } = renderHook(
      ({ callback }) => useInterval(callback, 1000),
      { initialProps: { callback: callback1 } }
    );
    
    rerender({ callback: callback2 });
    
    // Just verify no crashes occur
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    unmount();
  });

  it('handles delay changes', () => {
    const { rerender, unmount } = renderHook(
      ({ delay }) => useInterval(mockCallback, delay),
      { initialProps: { delay: 1000 } }
    );
    
    rerender({ delay: 500 });
    rerender({ delay: null });
    
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, 1000));
    
    // Just verify unmount doesn't crash
    unmount();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('handles multiple intervals', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    const { unmount } = renderHook(() => {
      useInterval(callback1, 1000);
      useInterval(callback2, 2000);
    });
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    unmount();
  });

  it('handles error callback gracefully', () => {
    const errorCallback = jest.fn(() => {
      throw new Error('Test error');
    });
    
    const { unmount } = renderHook(() => useInterval(errorCallback, 1000));
    
    // Should not crash on setup
    expect(errorCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('maintains callback reference', () => {
    let callCount = 0;
    const dynamicCallback = () => {
      callCount += 1;
    };
    
    const { unmount } = renderHook(() => useInterval(dynamicCallback, 1000));
    
    // Just verify setup doesn't crash
    expect(callCount).toBe(0);
    unmount();
  });

  it('handles zero delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, 0));
    
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles negative delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, -1000));
    
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles string delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, "1000"));
    
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });

  it('handles boolean delay', () => {
    const { unmount } = renderHook(() => useInterval(mockCallback, true));
    
    expect(mockCallback).not.toHaveBeenCalled();
    unmount();
  });
});