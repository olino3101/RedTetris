import { useEffect } from "react";
import Menu from "/src/components/Menu";
import Tetris from "/src/components/Tetris";
import { useGameOver } from "/src/hooks/UseGameOver";

const Game = ({ room, socket }) => {
    const [gameOver, setGameOver, resetGameOver] = useGameOver();
    const start = () => {
        socket.emit("startCountdown", { room });
    };

    useEffect(() => {
        socket.on("gameStart", () => {
            resetGameOver();
        });
    }, [socket, resetGameOver, gameOver]);

    return (
        <div className="Game">
            {gameOver ? (
                <Menu onClick={start} socket={socket} />
            ) : (
                <Tetris rows={20} columns={10} socket={socket} room={room} setGameOver={setGameOver} />
            )}
        </div>
    );
};

export default Game;

// ssolo
