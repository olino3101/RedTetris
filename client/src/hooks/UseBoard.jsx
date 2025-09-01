import { useState, useEffect } from "react";
import { buildBoard, nextBoard } from "../utils/Board";

export const useBoard = ({
  rows,
  columns,
  player,
  resetPlayer,
  addLinesCleared,
  addIndestructibleLines
}) => {
  const [board, setBoard] = useState(buildBoard({ rows, columns }));

  useEffect(() => {
    setBoard((previousBoard) =>
      nextBoard({
        board: previousBoard,
        player,
        resetPlayer,
        addLinesCleared,
        addIndestructibleLines
      })
    );
    // send 
  }, [player, resetPlayer, addLinesCleared]);

  return [board];
};
