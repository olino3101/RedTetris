import { defaultCell, indestructibleCell } from "./Cells";
import { transferToBoard } from "./Tetrominoes";
import { movePlayer } from "./PlayerController";
import { punishOther } from "../utils/UseServer";

export const buildBoard = ({ rows, columns }) => {
    const builtRows = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
    return {
        rows: builtRows,
        size: { rows, columns },
    };
};

const findDropPosition = ({ board, position, shape }) => {
    const max = board.size.rows - position.row;

    const iCollided = (max, i) => {
        const delta = { row: i, column: 0 };
        const result = movePlayer({ delta, position, shape, board });
        const { collided } = result;
        if (!collided && i !== max) return iCollided(max, i + 1);
        return i - 1;
    };
    const row = position.row + iCollided(max, 0);

    return { ...position, row };
};

export const nextBoard = ({
    board,
    player,
    resetPlayer,
    addLinesCleared,
    addIndestructibleLines,
    socket,
    room,
}) => {
    const { tetromino, position } = player;

    const updateOccupiedRows = board.rows.map((row) =>
        row.map((cell) => (cell.occupied ? cell : { ...defaultCell }))
    );

    // If no tetromino yet (still loading), return current board
    if (!tetromino) {
        return {
            rows: updateOccupiedRows,
            size: { ...board.size },
        };
    }

    const dropPosition = findDropPosition({
        board,
        position,
        shape: tetromino.shape,
    });

    const className = `${tetromino.className} ${(!player.isFastDropping && !player.collided) ? "ghost" : ""}`;

    // update tetromino/ghost
    const updateTetrominoRows = updateGhostAndTetromino({
        className,
        player,
        dropPosition,
        rows: updateOccupiedRows,
        tetromino,
        position,
        resetPlayer,
    });

    // clear the lines that are full
    const { clearedRows, linesCleared } = clearLines(updateTetrominoRows);

    if (linesCleared > 0) {
        addLinesCleared(linesCleared);
    }
    const linesToPunish = Math.floor(linesCleared / 2);
    if (linesToPunish > 0) punishOther(linesToPunish, socket, room);

    // add the rows that are indestructable
    const withIndestrucableRows = indestructibleLines(
        clearedRows,
        addIndestructibleLines
    );

    // Only reset when the piece is actually locked
    if (player && player.collided) {
        resetPlayer();
    }
    return {
        rows: withIndestrucableRows,
        size: { ...board.size },
    };
};

export const hasCollision = ({ board, position, shape }) => {
    return !shape.every((row, y) =>
        row.every((cell, x) => {
            if (shape[y][x] !== 1) {
                return true;
            }
            return !board?.rows[position.row + y]?.[position.column + x]
                ?.occupied;
        })
    );
};

export const isWithinBoard = ({ board, position, shape }) => {
    return shape.every((row, y) =>
        row.every((cell, x) => {
            if (!cell) return true;
            return !!board.rows[position.row + y]?.[position.column + x];
        })
    );
};

const clearLines = (rows) => {
    const blankRow = rows[0].map(() => ({ ...defaultCell }));
    const { acc, linesCleared } = [...rows].reduce(
        ({ acc, linesCleared }, row) => {
            if (
                row.every(
                    (column) =>
                        column.occupied && row[0].className != "indestructible"
                )
            ) {
                return {
                    acc: [...acc],
                    linesCleared: linesCleared + 1,
                };
            } else {
                return {
                    acc: [...acc, [...row]],
                    linesCleared,
                };
            }
        },
        { acc: [], linesCleared: 0 }
    );

    const BlankRows = Array(linesCleared).fill(blankRow);
    const clearedRows = linesCleared > 0 ? [...BlankRows, ...acc] : [...acc];

    return { clearedRows, linesCleared };
};

const indestructibleLines = (rows, addIndestructibleLines) => {
    const indestructibleLine = rows[0].map(() => ({ ...indestructibleCell }));
    const reverseRows = [...rows].reverse();
    const count = rows.filter(
        (row) => row[0].className === "indestructible"
    ).length;

    if (addIndestructibleLines === 0 || addIndestructibleLines === count) return [...rows];
    const newRows = reverseRows
        .reduce(
            ({ acc, count }, row) => {
                if (count < addIndestructibleLines) {
                    return {
                        acc: [...acc, [...indestructibleLine], [...row]],
                        count: count + 1,
                    };
                }
                if (acc.length == rows.length)
                    return { acc, count };
                return {
                    acc: [...acc, [...row]],
                    count,
                };
            },
            {
                acc: [],
                count: rows.filter(
                    (row) => row[0].className === "indestructible"
                ).length,
            }
        )
        .acc.reverse();
    return newRows;
};

const updateGhostAndTetromino = ({
    className,
    player,
    dropPosition,
    rows,
    tetromino,
    position,
    resetPlayer
}) => {

    // Fast drop: draw piece locked at drop position only
    if (player.isFastDropping) {

        const newRow = transferToBoard({
            className: tetromino.className,
            isOccupied: true,
            position: dropPosition,
            rows,
            shape: tetromino.shape,
        });
        return newRow;
    }
    // Ghost piece      
    const withGhost = className.includes("ghost")
        ? transferToBoard({
            className,
            isOccupied: false,
            position: dropPosition,
            rows,
            shape: tetromino.shape,
        })
        : rows;

    const withTetromino = transferToBoard({
        className: tetromino.className,
        isOccupied: player.collided,
        position,
        rows: withGhost,
        shape: tetromino.shape,
    });

    return withTetromino;
};
