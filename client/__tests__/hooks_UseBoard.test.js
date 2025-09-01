import { renderHook, act } from '@testing-library/react';
import { useBoard } from '../src/hooks/UseBoard';

// Mock the Board utilities
jest.mock('../src/utils/Board', () => ({
  buildBoard: jest.fn(),
  nextBoard: jest.fn()
}));

const mockBuildBoard = require('../src/utils/Board').buildBoard;
const mockNextBoard = require('../src/utils/Board').nextBoard;

describe('useBoard', () => {
  const defaultParams = {
    rows: 20,
    columns: 10,
    player: {
      position: { row: 0, column: 4 },
      tetromino: { shape: [[1]], className: 'test' }
    },
    resetPlayer: jest.fn(),
    addLinesCleared: jest.fn(),
    addIndestructibleLines: jest.fn()
  };

  const mockBoard = {
    rows: Array(20).fill(Array(10).fill({ occupied: false, className: '' })),
    size: { rows: 20, columns: 10 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildBoard.mockReturnValue(mockBoard);
    mockNextBoard.mockReturnValue(mockBoard);
  });

  it('initializes with board from buildBoard', () => {
    const { result } = renderHook(() => useBoard(defaultParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
    expect(result.current[0]).toEqual(mockBoard);
  });

  it('calls buildBoard with correct parameters', () => {
    renderHook(() => useBoard(defaultParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });



  it('handles different board sizes', () => {
    const customParams = { ...defaultParams, rows: 15, columns: 8 };
    renderHook(() => useBoard(customParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 15, columns: 8 });
  });

  it('handles zero dimensions', () => {
    const zeroParams = { ...defaultParams, rows: 0, columns: 0 };
    renderHook(() => useBoard(zeroParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 0, columns: 0 });
  });

  it('handles very large dimensions', () => {
    const largeParams = { ...defaultParams, rows: 100, columns: 50 };
    renderHook(() => useBoard(largeParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 100, columns: 50 });
  });

  it('handles undefined parameters gracefully', () => {
    const incompleteParams = { rows: 20, columns: 10 };
    renderHook(() => useBoard(incompleteParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles null parameters gracefully', () => {
    const nullParams = { ...defaultParams, player: null };
    renderHook(() => useBoard(nullParams));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles missing parameters gracefully', () => {
    renderHook(() => useBoard({}));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: undefined, columns: undefined });
  });

  it('returns board in array format', () => {
    const { result } = renderHook(() => useBoard(defaultParams));

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toEqual(mockBoard);
  });
  it('handles complex player objects', () => {
    const complexPlayer = {
      position: { row: 5, column: 3 },
      tetromino: {
        shape: [[1, 1], [1, 1]],
        className: 'tetromino__o'
      },
      collided: false,
      isFastDropping: false
    };

    renderHook(() => useBoard({ ...defaultParams, player: complexPlayer }));

    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });
});