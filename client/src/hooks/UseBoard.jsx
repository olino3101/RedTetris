import { useState, useEffect } from "react";
import { buildBoard, nextBoard } from "../utils/Board";

export const useBoard = ({
    rows,
    columns,
    player,
    resetPlayer,
    addLinesCleared,
    addIndestructibleLines,
}) => {
    const [board, setBoard] = useState(buildBoard({ rows, columns }));

    useEffect(() => {
        // Only update board if player is loaded
        if (player) {
            setBoard((previousBoard) =>
                nextBoard({
                    board: previousBoard,
                    player,
                    resetPlayer,
                    addLinesCleared,
                    addIndestructibleLines,
                })
            );
        }
    }, [player, resetPlayer, addLinesCleared, addIndestructibleLines]);

    return [board];
};
