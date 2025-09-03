import { useState, useCallback, useEffect } from "react";
import { getNextTetromino } from "../utils/UseServer";

const buildPlayer = async (socket, room) => {
    const tetromino = await getNextTetromino(socket, room);
    return {
        collided: false,
        isFastDropping: false,
        position: { row: 0, column: 4 },
        tetromino,
    };
};

export const usePlayer = (socket, room) => {
    const [player, setPlayer] = useState(null); // Start with null while loading

    const resetPlayer = useCallback(async () => {
        const newPlayer = await buildPlayer(socket, room);
        setPlayer(newPlayer);
    }, [socket, room]);

    // Initialize player on mount
    useEffect(() => {
        if (socket && room) {
            resetPlayer();
        }
    }, [socket, room, resetPlayer]);

    return [player, setPlayer, resetPlayer];
};
