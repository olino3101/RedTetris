import * as PlayerController from '../src/utils/PlayerController';
import { Action } from '../src/utils/Input';

// Mock dependencies
jest.mock('../src/utils/Board', () => ({
    hasCollision: jest.fn(),
    isWithinBoard: jest.fn()
}));

jest.mock('../src/utils/Tetrominoes', () => ({
    rotate: jest.fn()
}));

const { hasCollision, isWithinBoard } = require('../src/utils/Board');
const { rotate } = require('../src/utils/Tetrominoes');

describe('PlayerController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('module is defined', () => {
        expect(PlayerController).toBeDefined();
    });

    describe('movePlayer', () => {
        const board = {};
        const position = { row: 5, column: 3 };
        const shape = [[1, 1], [1, 1]];

        it('returns original position when move would go out of bounds', () => {
            const delta = { row: 0, column: 1 };

            isWithinBoard.mockReturnValue(false);
            hasCollision.mockReturnValue(false);

            const result = PlayerController.movePlayer({ delta, position, shape, board });

            expect(result.nextPosition).toEqual(position);
            expect(result.collided).toBe(false);
        });

        it('returns original position when move would cause collision', () => {
            const delta = { row: 0, column: 1 };

            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(true);

            const result = PlayerController.movePlayer({ delta, position, shape, board });

            expect(result.nextPosition).toEqual(position);
            expect(result.collided).toBe(false);
        });

        it('returns new position when move is valid', () => {
            const delta = { row: 0, column: 1 };
            const expectedPosition = { row: 5, column: 4 };

            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            const result = PlayerController.movePlayer({ delta, position, shape, board });

            expect(result.nextPosition).toEqual(expectedPosition);
            expect(result.collided).toBe(false);
        });

        it('detects collision when moving down and hit occurs', () => {
            const delta = { row: 1, column: 0 };

            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(true);

            const result = PlayerController.movePlayer({ delta, position, shape, board });

            expect(result.collided).toBe(true);
            expect(result.nextPosition).toEqual(position);
        });

        it('detects collision when moving down and going out of bounds', () => {
            const delta = { row: 1, column: 0 };

            isWithinBoard.mockReturnValue(false);
            hasCollision.mockReturnValue(false);

            const result = PlayerController.movePlayer({ delta, position, shape, board });

            expect(result.collided).toBe(true);
            expect(result.nextPosition).toEqual(position);
        });
    });

    describe('isGoingToCollided', () => {
        it('returns true when piece will collide on next drop', () => {
            const board = {};
            const player = {
                position: { row: 5, column: 3 },
                tetromino: { shape: [[1, 1], [1, 1]] }
            };

            hasCollision.mockReturnValue(true);

            const result = PlayerController.isGoingToCollided({ board, player });

            expect(result).toBe(true);
            expect(hasCollision).toHaveBeenCalledWith({
                board,
                position: { row: 6, column: 3 },
                shape: [[1, 1], [1, 1]]
            });
        });

        it('returns false when piece will not collide on next drop', () => {
            const board = {};
            const player = {
                position: { row: 5, column: 3 },
                tetromino: { shape: [[1, 1], [1, 1]] }
            };

            hasCollision.mockReturnValue(false);

            const result = PlayerController.isGoingToCollided({ board, player });

            expect(result).toBe(false);
        });
    });

    describe('playerController', () => {
        const mockProps = {
            board: {},
            player: {
                position: { row: 5, column: 3 },
                tetromino: { shape: [[1, 1], [1, 1]] },
                collided: false,
                isFastDropping: false
            },
            setPlayer: jest.fn(),
            setGameOver: jest.fn(),
            room: 'testroom',
            name: 'testplayer',
            socket: { emit: jest.fn() }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('does nothing when action is null or undefined', () => {
            PlayerController.playerController({
                ...mockProps,
                action: null
            });

            expect(mockProps.setPlayer).not.toHaveBeenCalled();
            expect(mockProps.setGameOver).not.toHaveBeenCalled();

            PlayerController.playerController({
                ...mockProps,
                action: undefined
            });

            expect(mockProps.setPlayer).not.toHaveBeenCalled();
            expect(mockProps.setGameOver).not.toHaveBeenCalled();
        });

        it('handles rotation action successfully', () => {
            const rotatedShape = [[1, 1, 1], [0, 1, 0]];
            rotate.mockReturnValue(rotatedShape);
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Rotate
            });

            expect(rotate).toHaveBeenCalledWith({
                piece: mockProps.player.tetromino.shape,
                direction: 1
            });
            expect(mockProps.setPlayer).toHaveBeenCalledWith({
                ...mockProps.player,
                tetromino: {
                    ...mockProps.player.tetromino,
                    shape: rotatedShape
                }
            });
        });

        it('handles failed rotation when out of bounds', () => {
            const rotatedShape = [[1, 1, 1], [0, 1, 0]];
            rotate.mockReturnValue(rotatedShape);
            isWithinBoard.mockReturnValue(false);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Rotate
            });

            expect(mockProps.setPlayer).not.toHaveBeenCalled();
        });

        it('handles failed rotation when collision occurs', () => {
            const rotatedShape = [[1, 1, 1], [0, 1, 0]];
            rotate.mockReturnValue(rotatedShape);
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(true);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Rotate
            });

            expect(mockProps.setPlayer).not.toHaveBeenCalled();
        });

        it('handles fast drop action', () => {
            isWithinBoard.mockReturnValueOnce(true).mockReturnValueOnce(false);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.FastDrop
            });

            expect(mockProps.setPlayer).toHaveBeenCalledWith({
                ...mockProps.player,
                collided: true,
                isFastDropping: false,
                position: { row: 6, column: 3 } // Computed drop position
            });
        });

        it('handles fast drop with game over', () => {
            isWithinBoard.mockReturnValue(false);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                player: { ...mockProps.player, position: { row: 0, column: 3 } },
                action: Action.FastDrop
            });

            expect(mockProps.setGameOver).toHaveBeenCalledWith(true);
            expect(mockProps.socket.emit).toHaveBeenCalledWith('gameLost', { room: 'testroom' });
            expect(mockProps.socket.emit).toHaveBeenCalledWith('joinRoom', { room: 'testroom', name: 'testplayer' });
        });

        it('handles socket errors in fast drop gracefully', () => {
            const mockSocket = {
                emit: jest.fn().mockImplementation(() => {
                    throw new Error('Socket error');
                })
            };

            isWithinBoard.mockReturnValue(false);

            expect(() => {
                PlayerController.playerController({
                    ...mockProps,
                    socket: mockSocket,
                    player: { ...mockProps.player, position: { row: 0, column: 3 } },
                    action: Action.FastDrop
                });
            }).not.toThrow();
        });

        it('handles left movement', () => {
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Left
            });

            expect(mockProps.setPlayer).toHaveBeenCalledWith({
                ...mockProps.player,
                collided: false,
                isFastDropping: false,
                position: { row: 5, column: 2 }
            });
        });

        it('handles right movement', () => {
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Right
            });

            expect(mockProps.setPlayer).toHaveBeenCalledWith({
                ...mockProps.player,
                collided: false,
                isFastDropping: false,
                position: { row: 5, column: 4 }
            });
        });

        it('handles slow drop movement', () => {
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.SlowDrop
            });

            expect(mockProps.setPlayer).toHaveBeenCalledWith({
                ...mockProps.player,
                collided: false,
                isFastDropping: false,
                position: { row: 6, column: 3 }
            });
        });

        it('handles game over on collision at top', () => {
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(true);

            PlayerController.playerController({
                ...mockProps,
                player: { ...mockProps.player, position: { row: 0, column: 3 } },
                action: Action.SlowDrop
            });

            expect(mockProps.setGameOver).toHaveBeenCalledWith(true);
            expect(mockProps.socket.emit).toHaveBeenCalledWith('gameLost', { room: 'testroom' });
            expect(mockProps.socket.emit).toHaveBeenCalledWith('joinRoom', { room: 'testroom', name: 'testplayer' });
        });

        it('handles socket errors in movement gracefully', () => {
            const mockSocket = {
                emit: jest.fn().mockImplementation(() => {
                    throw new Error('Socket error');
                })
            };

            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(true);

            expect(() => {
                PlayerController.playerController({
                    ...mockProps,
                    socket: mockSocket,
                    player: { ...mockProps.player, position: { row: 0, column: 3 } },
                    action: Action.SlowDrop
                });
            }).not.toThrow();
        });
    });
});
