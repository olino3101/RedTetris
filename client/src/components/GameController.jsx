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
    name,
    setPlayer,
}) => {
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({
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
            socket.emit("joinRoom", { room, name });
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
            name,
            socket
        });
    };

    // Clamp interval to avoid too-fast rerenders
    const baseDrop = dropTime ?? 400;
    const multiplier = isGoingToCollided({ board, player }) ? 4 : 1;
    const clamped = Math.max(50, baseDrop * multiplier);

    useInterval(() => {
        handleInput({ action: Action.SlowDrop });
    }, clamped);

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
