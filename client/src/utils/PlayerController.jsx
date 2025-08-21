import { hasCollision, isWithinBoard } from "/src/utils/Board";
import { Action } from "/src/utils/Input"
import { rotate } from "/src/utils/Tetrominoes"

const attemptRotation = ({ board, player, setPlayer }) => {
    const shape = rotate({
        piece: player.tetromino.shape,
        direction: 1
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
                shape
            }
        });
    } else {
        return false;
    }
};

export const playerController = ({
    action,
    board,
    player,
    setPlayer,
    setGameOver
}) => {

    console.log(action);
    if (!action) return;

    if (action === Action.Rotate) {
        console.log("attempt rotate");
        attemptRotation({ board, player, setPlayer });
    }
};