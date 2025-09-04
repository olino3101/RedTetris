import { hasCollision, isWithinBoard } from "/src/utils/Board";
import { Action } from "/src/utils/Input";
import { rotate } from "/src/utils/Tetrominoes";

// Compute landing position for hard drop
const computeDropPosition = ({ board, position, shape }) => {
    let row = position.row;
    while (true) {
        const next = { row: row + 1, column: position.column };
        const onBoard = isWithinBoard({ board, position: next, shape });
        const collided = hasCollision({ board, position: next, shape });
        if (!onBoard || collided) break;
        row += 1;
    }
    return { ...position, row };
};

const attemptRotation = ({ board, player, setPlayer }) => {
    const shape = rotate({
        piece: player.tetromino.shape,
        direction: 1,
    });

    const position = player.position;
    const isValidRotation =
        isWithinBoard({ board, position, shape }) &&
        !hasCollision({ board, position, shape });

    if (isValidRotation) {
        setPlayer({
            ...player,
            tetromino: {
                ...player.tetromino,
                shape,
            },
        });
    } else {
        return false;
    }
};

export const movePlayer = ({ delta, position, shape, board }) => {
    const desiredNextPosition = {
        row: position.row + delta.row,
        column: position.column + delta.column,
    };

    const collided = hasCollision({
        board,
        position: desiredNextPosition,
        shape,
    });

    const isOnBoard = isWithinBoard({
        board,
        position: desiredNextPosition,
        shape,
    });

    const preventMove = !isOnBoard || (isOnBoard && collided);
    const nextPosition = preventMove ? position : desiredNextPosition;

    const isMovingDown = delta.row > 0;
    const isHit = isMovingDown && (collided || !isOnBoard);
    return { collided: isHit, nextPosition };
};

const attemptMovement = ({
    board,
    action,
    player,
    setPlayer,
    setGameOver,
    room,
    name,
    socket,
}) => {
    // Atomic hard drop
    if (action === Action.FastDrop) {
        const dropPosition = computeDropPosition({
            board,
            position: player.position,
            shape: player.tetromino.shape,
        });

        const isGameOver = dropPosition.row === 0;
        if (isGameOver) {
            setGameOver(true);
            try { socket.emit("gameLost", { room }); } catch (_) { }
            try { socket.emit("joinRoom", { room, name }); } catch (_) { }
        }

        setPlayer({
            ...player,
            collided: true,
            isFastDropping: false,
            position: dropPosition,
        });
        return;
    }

    const delta = { row: 0, column: 0 };
    if (action === Action.SlowDrop) {
        delta.row += 1;
    } else if (action === Action.Left) {
        delta.column -= 1;
    } else if (action === Action.Right) {
        delta.column += 1;
    }

    const { collided, nextPosition } = movePlayer({
        delta,
        position: player.position,
        shape: player.tetromino.shape,
        board,
    });

    const isGameOver = collided && player.position.row === 0;
    if (isGameOver) {
        setGameOver(isGameOver);
        try { socket.emit("gameLost", { room }); } catch (_) { }
        try { socket.emit("joinRoom", { room, name }); } catch (_) { }
    }

    setPlayer({
        ...player,
        collided,
        isFastDropping: false,
        position: nextPosition,
    });
};

export const playerController = ({
    action,
    board,
    player,
    setPlayer,
    setGameOver,
    room,
    name,
    socket,
}) => {
    if (!action) return;

    if (action === Action.Rotate) {
        attemptRotation({ board, player, setPlayer });
    } else {
        attemptMovement({
            board,
            player,
            setPlayer,
            action,
            setGameOver,
            room,
            name,
            socket,
        });
    }
};

export const isGoingToCollided = ({ board, player }) => {
    const { tetromino, position } = player;
    const nextPosition = { row: position.row + 1, column: position.column };
    return hasCollision({
        board,
        position: nextPosition,
        shape: tetromino.shape,
    });
};
