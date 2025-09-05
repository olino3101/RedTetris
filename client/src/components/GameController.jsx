import "./GameController.css";
import { useEffect, useCallback } from "react";

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

    const handleInput = useCallback(({ action }) => {
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
    }, [board, player, setPlayer, setGameOver, room, name, socket]);

    const onKeyUp = useCallback(({ code }) => {
        const action = actionForKey(code);
        if (actionIsDrop(action)) resumeDropTime();
    }, [resumeDropTime]);

    const onKeyDown = useCallback(({ code }) => {
        const action = actionForKey(code);

        if (action == Action.Quit) {
            setGameOver(true);
            socket.emit("gameLost", { room });
            socket.emit("joinRoom", { room, name });
        } else {
            if (actionIsDrop(action)) pauseDropTime();
            handleInput({ action });
        }
    }, [pauseDropTime, setGameOver, socket, room, name, handleInput]);

    // Add global event listeners for keyboard events
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        // Cleanup event listeners on component unmount
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, [onKeyDown, onKeyUp]);

    // Clamp interval to avoid too-fast rerenders
    const baseDrop = dropTime ?? 400;
    const multiplier = isGoingToCollided({ board, player }) ? 4 : 1;
    const clamped = Math.max(50, baseDrop * multiplier);

    useInterval(() => {
        handleInput({ action: Action.SlowDrop });
    }, clamped);

    return (
        <div className="GameController">
            {/* Hidden div - keyboard events are now handled globally */}
        </div>
    );
};

export default GameController;
