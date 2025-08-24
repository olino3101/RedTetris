import "./Tetris.css";

import Board from "/src/components/Board";
import GameStats from "/src/components/GameStats";
// import Previews from "/src/components/Previews";
import GameController from "./GameController";

import { useBoard } from "/src/hooks/UseBoard";
import { useGameStats } from "/src/hooks/UseGameStats";
import { usePlayer } from "/src/hooks/UsePlayer";
import { useServerData } from "/src/hooks/UseServerData"

const Tetris = ({ rows, columns, setGameOver }) => {
  const [gameStats, addLinesCleared] = useGameStats();
  const [player, setPlayer, resetPlayer] = usePlayer();
  const [addIndestructibleLines] = useServerData();
  // debugger;

  const [board, setBoard] = useBoard(
    {
      rows,
      columns,
      player,
      resetPlayer,
      addLinesCleared,
      addIndestructibleLines
    });

  // debugger;

  return (
    <div className="Tetris">
      <Board board={board} />
      <GameStats gameStats={gameStats} />
      {/* <Previews tetrominoes={player.tetrominoes} /> */}
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    </div>
  );
};
export default Tetris;
