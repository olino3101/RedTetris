import "./Tetris.css";

import Board from "/src/components/Board";
import GameStats from "/src/components/GameStats";
import Spectrums from "/src/components/Spectrums";
import GameController from "./GameController";

import { useBoard } from "/src/hooks/UseBoard";
import { useGameStats } from "/src/hooks/UseGameStats";
import { usePlayer } from "/src/hooks/UsePlayer";
import { useServerData } from "/src/hooks/UseServer";

const Tetris = ({ rows, columns, socket, room, setGameOver }) => {
    const [gameStats, addLinesCleared] = useGameStats();
    const [player, setPlayer, resetPlayer] = usePlayer(socket, room);
    const [addIndestructibleLines, players] = useServerData();

    const [board, setBoard] = useBoard({
        rows,
        columns,
        player,
        resetPlayer,
        addLinesCleared,
        addIndestructibleLines,
    });

    // Show loading state while player is being initialized
    if (!player) {
        return <div className="Tetris loading">Loading...</div>;
    }

    return (
        <div className="Tetris">
            <Board board={board} />
            <GameStats gameStats={gameStats} />
            <Spectrums players={board} />
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
