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

  it('calls nextBoard when player changes', () => {
    const { rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // Change player
    const newPlayer = { ...defaultParams.player, position: { row: 1, column: 4 } };
    rerender(() => useBoard({ ...defaultParams, player: newPlayer }));
    
    expect(mockNextBoard).toHaveBeenCalledWith({
      board: mockBoard,
      player: newPlayer,
      resetPlayer: defaultParams.resetPlayer,
      addLinesCleared: defaultParams.addLinesCleared,
      addIndestructibleLines: defaultParams.addIndestructibleLines
    });
  });

  it('calls nextBoard when resetPlayer changes', () => {
    const { rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // Change resetPlayer
    const newResetPlayer = jest.fn();
    rerender(() => useBoard({ ...defaultParams, resetPlayer: newResetPlayer }));
    
    expect(mockNextBoard).toHaveBeenCalledWith({
      board: mockBoard,
      player: defaultParams.player,
      resetPlayer: newResetPlayer,
      addLinesCleared: defaultParams.addLinesCleared,
      addIndestructibleLines: defaultParams.addIndestructibleLines
    });
  });

  it('calls nextBoard when addLinesCleared changes', () => {
    const { rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // Change addLinesCleared
    const newAddLinesCleared = jest.fn();
    rerender(() => useBoard({ ...defaultParams, addLinesCleared: newAddLinesCleared }));
    
    expect(mockNextBoard).toHaveBeenCalledWith({
      board: mockBoard,
      player: defaultParams.player,
      resetPlayer: defaultParams.resetPlayer,
      addLinesCleared: newAddLinesCleared,
      addIndestructibleLines: defaultParams.addIndestructibleLines
    });
  });

  it('does not call nextBoard when addIndestructibleLines changes', () => {
    const { rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // Change addIndestructibleLines
    const newAddIndestructibleLines = jest.fn();
    rerender(() => useBoard({ ...defaultParams, addIndestructibleLines: newAddIndestructibleLines }));
    
    // Should not call nextBoard since addIndestructibleLines is not in dependency array
    expect(mockNextBoard).not.toHaveBeenCalled();
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

  it('updates board when nextBoard returns new board', () => {
    const newBoard = {
      rows: Array(20).fill(Array(10).fill({ occupied: true, className: 'updated' })),
      size: { rows: 20, columns: 10 }
    };
    mockNextBoard.mockReturnValue(newBoard);
    
    const { result, rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial board
    expect(result.current[0]).toEqual(mockBoard);
    
    // Change player to trigger nextBoard
    const newPlayer = { ...defaultParams.player, position: { row: 1, column: 4 } };
    rerender(() => useBoard({ ...defaultParams, player: newPlayer }));
    
    // Should now have the new board
    expect(result.current[0]).toEqual(newBoard);
  });

  it('handles multiple player changes', () => {
    const { result, rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // First change
    const player1 = { ...defaultParams.player, position: { row: 1, column: 4 } };
    rerender(() => useBoard({ ...defaultParams, player: player1 }));
    expect(mockNextBoard).toHaveBeenCalledTimes(1);
    
    // Second change
    const player2 = { ...defaultParams.player, position: { row: 2, column: 4 } };
    rerender(() => useBoard({ ...defaultParams, player: player2 }));
    expect(mockNextBoard).toHaveBeenCalledTimes(2);
  });

  it('handles function parameter changes', () => {
    const { rerender } = renderHook(() => useBoard(defaultParams));
    
    // Initial render
    expect(mockNextBoard).not.toHaveBeenCalled();
    
    // Change resetPlayer function
    const newResetPlayer = jest.fn();
    rerender(() => useBoard({ ...defaultParams, resetPlayer: newResetPlayer }));
    expect(mockNextBoard).toHaveBeenCalledTimes(1);
    
    // Change addLinesCleared function
    const newAddLinesCleared = jest.fn();
    rerender(() => useBoard({ ...defaultParams, addLinesCleared: newAddLinesCleared }));
    expect(mockNextBoard).toHaveBeenCalledTimes(2);
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

  it('handles empty player object', () => {
    const emptyPlayer = {};
    
    renderHook(() => useBoard({ ...defaultParams, player: emptyPlayer }));
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles board with custom cell data', () => {
    const customBoard = {
      rows: Array(20).fill(Array(10).fill({ occupied: true, className: 'custom' })),
      size: { rows: 20, columns: 10 }
    };
    mockBuildBoard.mockReturnValue(customBoard);
    
    const { result } = renderHook(() => useBoard(defaultParams));
    
    expect(result.current[0]).toEqual(customBoard);
  });
});