import { renderHook, act } from '@testing-library/react';
import { useOpponentsBoards, useOpponentsBoardsFromSocket } from '../src/hooks/UseOpponentsBoard';

// Mock socket
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
};

describe('UseOpponentsBoard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useOpponentsBoards', () => {
        it('should initialize with empty map by default', () => {
            const { result } = renderHook(() => useOpponentsBoards());

            expect(result.current.map).toBeInstanceOf(Map);
            expect(result.current.map.size).toBe(0);
            expect(typeof result.current.set).toBe('function');
        });

        it('should initialize with provided initial boards', () => {
            const initialMap = new Map([['player1', { board: 'data1' }]]);
            const { result } = renderHook(() => useOpponentsBoards(initialMap));

            expect(result.current.map).toEqual(initialMap);
            expect(result.current.map.size).toBe(1);
            expect(result.current.map.get('player1')).toEqual({ board: 'data1' });
        });

        it('should update map when set is called', () => {
            const { result } = renderHook(() => useOpponentsBoards());

            act(() => {
                result.current.set('player1', { board: 'testboard' });
            });

            expect(result.current.map.size).toBe(1);
            expect(result.current.map.get('player1')).toEqual({ board: 'testboard' });
        });

        it('should add multiple players to map', () => {
            const { result } = renderHook(() => useOpponentsBoards());

            act(() => {
                result.current.set('player1', { board: 'board1' });
                result.current.set('player2', { board: 'board2' });
            });

            expect(result.current.map.size).toBe(2);
            expect(result.current.map.get('player1')).toEqual({ board: 'board1' });
            expect(result.current.map.get('player2')).toEqual({ board: 'board2' });
        });

        it('should overwrite existing player data', () => {
            const { result } = renderHook(() => useOpponentsBoards());

            act(() => {
                result.current.set('player1', { board: 'oldboard' });
                result.current.set('player1', { board: 'newboard' });
            });

            expect(result.current.map.size).toBe(1);
            expect(result.current.map.get('player1')).toEqual({ board: 'newboard' });
        });
    });

    describe('useOpponentsBoardsFromSocket', () => {
        it('should initialize with empty map when no socket', () => {
            const { result } = renderHook(() => useOpponentsBoardsFromSocket(null));

            expect(result.current).toBeInstanceOf(Map);
            expect(result.current.size).toBe(0);
        });

        it('should initialize with provided initial boards', () => {
            const initialMap = new Map([['player1', { board: 'data1' }]]);
            const { result } = renderHook(() => useOpponentsBoardsFromSocket(mockSocket, initialMap));

            expect(result.current.size).toBe(1);
            expect(result.current.get('player1')).toEqual({ board: 'data1' });
        });

        it('should setup socket listeners when socket is provided', () => {
            renderHook(() => useOpponentsBoardsFromSocket(mockSocket));

            expect(mockSocket.on).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));
        });

        it('should update map when BoardOpponents event is received', () => {
            let eventHandler;
            mockSocket.on.mockImplementation((event, handler) => {
                if (event === 'BoardOpponents') {
                    eventHandler = handler;
                }
            });

            const { result } = renderHook(() => useOpponentsBoardsFromSocket(mockSocket));

            expect(eventHandler).toBeDefined();

            act(() => {
                eventHandler({ board: 'testboard', name: 'player1' });
            });

            expect(result.current.size).toBe(1);
            expect(result.current.get('player1')).toBe('testboard');
        });

        it('should handle multiple BoardOpponents events', () => {
            let eventHandler;
            mockSocket.on.mockImplementation((event, handler) => {
                if (event === 'BoardOpponents') {
                    eventHandler = handler;
                }
            });

            const { result } = renderHook(() => useOpponentsBoardsFromSocket(mockSocket));

            act(() => {
                eventHandler({ board: 'board1', name: 'player1' });
                eventHandler({ board: 'board2', name: 'player2' });
            });

            expect(result.current.size).toBe(2);
            expect(result.current.get('player1')).toBe('board1');
            expect(result.current.get('player2')).toBe('board2');
        });

        it('should cleanup socket listeners on unmount', () => {
            const { unmount } = renderHook(() => useOpponentsBoardsFromSocket(mockSocket));

            unmount();

            expect(mockSocket.off).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));
        });

        it('should not setup listeners when socket is null', () => {
            renderHook(() => useOpponentsBoardsFromSocket(null));

            expect(mockSocket.on).not.toHaveBeenCalled();
        });

        it('should re-setup listeners when socket changes', () => {
            const mockSocket2 = {
                on: jest.fn(),
                off: jest.fn()
            };

            const { rerender } = renderHook(
                ({ socket }) => useOpponentsBoardsFromSocket(socket),
                { initialProps: { socket: mockSocket } }
            );

            expect(mockSocket.on).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));

            rerender({ socket: mockSocket2 });

            expect(mockSocket.off).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));
            expect(mockSocket2.on).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));
        });
    });
});
