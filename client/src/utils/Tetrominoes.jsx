const className = "tetromino";

export const TETROMINOES = {
    I: {
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        className: `${className} ${className}__i`
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        className: `${className} ${className}__o`
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        className: `${className} ${className}__t`
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        className: `${className} ${className}__s`
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        className: `${className} ${className}__z`
    },
    J: {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        className: `${className} ${className}__j`
    },
    L: {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        className: `${className} ${className}__l`
    }
};

export const randomTetromino = () => {
    const keys = Object.keys(TETROMINOES);
    const index = Math.floor(Math.random() * keys.length);
    const key = keys[index];
    return TETROMINOES[key];
}

export const transferToBoard = ({
    className,
    isOccupied,
    position,
    rows,
    shape
}) => {
    const newRows = [...rows].map((row, y) =>
        row.map((cell, x) => {
            const shapeY = y - position.row;
            const shapeX = x - position.column;

            const isInsideShape =
                shapeY >= 0 && shapeY < shape.length &&
                shapeX >= 0 && shapeX < shape[0].length;

            if (isInsideShape && shape[shapeY][shapeX]) {
                return { occupied: isOccupied, className };
            }

            return cell;
        })
    );
    return newRows;
}

export const rotate = ({ piece, direction }) => {
    const newPiece = piece.map((_, index) =>
        piece.map((column) => column[index])
    );

    if (direction > 0) return newPiece.map((row) => row.reverse());

    return newPiece.reverse();
}