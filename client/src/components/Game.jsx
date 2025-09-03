import { useEffect } from "react";
import Menu from "/src/components/Menu";
import Tetris from "/src/components/Tetris";
import { useGameOver } from "/src/hooks/UseGameOver";
import { useState } from "react";

const Game = ({ room, name, socket }) => {
    const [gameOver, setGameOver, resetGameOver] = useGameOver();
    const [errorMessage, setErrorMessage] = useState(null);
    const start = () => {
        socket.emit("startCountdown", { room }, (res) => {
            setErrorMessage(res.message);
        });
    };

    useEffect(() => {
        socket.on("gameStart", () => {
            setGameOver(false);
            setErrorMessage(null);
        });
        socket.on("gameAlreadyStarted", (data) => {
            setGameOver(true);
            setErrorMessage(data.message);
        });
        socket.on("endOfGame", () => {
            setGameOver(true);
            socket.emit("joinRoom", {room, name});
            console.log("rejoining room");
        })
    }, [socket, setGameOver, room, name, gameOver]);

    return (
        <div className="Game">
            {gameOver ? (
                <div>
                    {errorMessage}
                    <Menu onClick={start} socket={socket} />
                </div>
            ) : (
                <Tetris
                    rows={20}
                    columns={10}
                    socket={socket}
                    room={room}
                    setGameOver={setGameOver}
                />
            )}
        </div>
    );
};

export default Game;

// ssolo
