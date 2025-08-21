import "./Tetris.css";

import Board from "/src/components/Board";
import GameStats from "/src/components/GameStats";
import { useBoard } from "/src/hooks/UseBoard";
import { useGameStats } from "/src/hooks/UseGameStats";

const Tetris = ({ rows, columns, setGameOver }) => {
  const [gameStats, addLinesCleared] = useGameStats();
  const [board, setBoard] = useBoard({ rows, columns });
  return (
    <div classNam="Tetris">
      <Board board={board} />
      <GameStats gameStats={gameStats} />
    </div>
  );
};
export default Tetris;
