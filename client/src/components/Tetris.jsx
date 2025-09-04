import "./Tetris.css";

import Board from "/src/components/Board";
import GameStats from "/src/components/GameStats";
import Spectrums from "/src/components/Spectrums";
import GameController from "./GameController";

import { useBoard } from "/src/hooks/UseBoard";
import { useGameStats } from "/src/hooks/UseGameStats";
import { usePlayer } from "/src/hooks/UsePlayer";
import { sendBoard, getOpponentsBoards } from "/src/utils/UseServer";
import { usePunishedLine } from "../hooks/UsePunishLine";
const Tetris = ({ rows, columns, socket, room, name, setGameOver }) => {
  const [gameStats, addLinesCleared] = useGameStats();
  const [player, setPlayer, resetPlayer] = usePlayer(socket, room);
  const addIndestructibleLines = usePunishedLine(socket);
  const opponents = getOpponentsBoards(socket);

  if (player && (player.isFastDropping || player.collided)) {
    resetPlayer();
  }
  const [board, setBoard] = useBoard({
    rows,
    columns,
    player,
    resetPlayer,
    addLinesCleared,
    addIndestructibleLines,
    socket,
    room,
  });




  sendBoard(socket, room, board);

  if (!player) {
    return <div className="Tetris loading">Loading...</div>;
  }

  return (
    <div className="Tetris">
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        socket={socket}
        room={room}
        name={name}
        setPlayer={setPlayer}
      />
      <Board board={board} />
      <GameStats gameStats={gameStats} />
      <Spectrums opponents={opponents} />

    </div>
  );
};
export default Tetris;
