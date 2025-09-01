import { TETROMINOES, randomTetromino, transferToBoard, rotate } from '../src/utils/Tetrominoes.jsx';

describe('TETROMINOES', () => {
    it('should have all 7 tetrominoes', () => {
        expect(Object.keys(TETROMINOES)).toEqual(
            expect.arrayContaining(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
        );
    });
});

describe('randomTetromino', () => {
    it('returns a valid tetromino', () => {
        const tetro = randomTetromino();
        expect(Object.values(TETROMINOES)).toContainEqual(expect.objectContaining({ shape: tetro.shape }));
    });
});

describe('rotate', () => {
    it('rotates a piece clockwise', () => {
        const piece = [
            [1, 0],
            [0, 1]
        ];
        const rotated = rotate({ piece, direction: 1 });
        expect(rotated).toEqual([
            [0, 1],
            [1, 0]
        ]);
    });
    it('rotates a piece counterclockwise', () => {
        const piece = [
            [1, 0],
            [0, 1]
        ];
        const rotated = rotate({ piece, direction: -1 });
        expect(rotated).toEqual([
            [0, 1],
            [1, 0]
        ]);
    });
});

describe('transferToBoard', () => {
    it('places a shape on the board', () => {
        const rows = [
            [{ occupied: false, className: "" }, { occupied: false, className: "" }],
            [{ occupied: false, className: "" }, { occupied: false, className: "" }]
        ];
        const shape = [
            [1, 0],
            [0, 1]
        ];
        const result = transferToBoard({
            className: "tetromino__test",
            isOccupied: true,
            position: { row: 0, column: 0 },
            rows,
            shape
        });
        expect(result[0][0].occupied).toBe(true);
        expect(result[1][1].occupied).toBe(true);
    });
});
