import { useState, useCallback } from "react"

import { getNextTetromino } from "./UseServer"

const buildPlayer = (previous) => {
    return {
        collided: false,
        isFastDropping: false,
        position: { row: 0, column: 4 },
        tetromino: getNextTetromino()
    };
};

export const usePlayer = () => {

    const [player, setPlayer] = useState(buildPlayer());

    const resetPlayer = useCallback(() => {
        setPlayer((prev) => buildPlayer(prev));
    }, []);
    return [player, setPlayer, resetPlayer];
}