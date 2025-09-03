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
            action: Action.Left,
            board: {},
            player: {
                position: { row: 5, column: 3 },
                tetromino: { shape: [[1, 1], [1, 1]] }
            },
            setPlayer: jest.fn(),
            setGameOver: jest.fn(),
            room: 'testroom',
            socket: { emit: jest.fn() }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('handles movement actions', () => {
            isWithinBoard.mockReturnValue(true);
            hasCollision.mockReturnValue(false);

            PlayerController.playerController({
                ...mockProps,
                action: Action.Left
            });

            expect(mockProps.setPlayer).toHaveBeenCalled();
        });
    });
});
