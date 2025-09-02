import { useEffect, useState } from "react";
import "./Menu.css";

const Menu = ({ onClick, socket }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [playersList, setPlayersList] = useState([]);

    useEffect(() => {
        if (!socket) return;
        const handler = (data) => setTimeLeft(data.timeLeft);
        socket.on("roomCounter", handler);
        return () => socket.off("roomCounter", handler);
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        socket.on("playersUpdate", (data) => {
            setPlayersList(data.players);
        });
        return () => socket.off("playersUpdate");
    });

    const styledPlayersList = (players) => {
        const containerStyle = {
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px 16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "200px",
            zIndex: 1000,
        };

        const listStyle = {
            listStyleType: "none",
            padding: 0,
            margin: 0,
        };

        const itemStyle = {
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#333",
        };

        return (
            <div style={containerStyle}>
                <h4 style={{ marginTop: 0 }}>Players:</h4>
                <ul style={listStyle}>
                    {players.map((playerName, index) => (
                        <li key={index} style={itemStyle}>
                            {playerName}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="Menu">
            <button className="Button" onClick={onClick}>
                Play Tetris
            </button>
            {timeLeft !== null && <h1>{timeLeft}</h1>}
            <h2>{styledPlayersList(playersList)}</h2>
        </div>
    );
};

export default Menu;
