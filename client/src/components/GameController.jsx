import "./GameController.css";

import { Action, actionForKey, actionIsDrop } from "/src/utils/Input";
import { playerController, isGoingToCollided } from "/src/utils/PlayerController";

import { useInterval } from "/src/hooks/UseInterval";
import { useDropTime } from "/src/hooks/UseDropTime";

const GameController = ({
    board,
    gameStats,
    player,
    setGameOver,
    socket,
    room,
    setPlayer,
}) => {
    const [dropTime, pauseDropTime, resumeDropTime, DropTime] = useDropTime({
        gameStats,
    });



    const onKeyUp = ({ code }) => {
        const action = actionForKey(code);
        if (actionIsDrop(action)) resumeDropTime();
    };

    const onKeyDown = ({ code }) => {
        const action = actionForKey(code);

        if (action == Action.Quit) {
            setGameOver(true);
            socket.emit("gameLost", { room });
        } else {
            if (actionIsDrop(action)) pauseDropTime();
            handleInput({ action });
        }
    };

    const handleInput = ({ action }) => {
        playerController({
            action,
            board,
            player,
            setPlayer,
            setGameOver,
            room,
            socket
        });
    };

    // check if its going to collided if so add another frame of drop time

    const newdropTime = isGoingToCollided({ board, player }) ? dropTime * 4 : dropTime;
    useInterval(() => {
        handleInput({ action: Action.SlowDrop });
    }, newdropTime);

    return (
        <input
            className="GameController"
            type="text"
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            autoFocus
        />
    );
};

export default GameController;
