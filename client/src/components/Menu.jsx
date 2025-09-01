import { useEffect, useState } from "react";
import "./Menu.css";

const Menu = ({ onClick, socket }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!socket) return;
        const handler = (data) => setTimeLeft(data.timeLeft);
        socket.on("roomCounter", handler);
        return () => socket.off("roomCounter", handler);
    }, [socket]);

    return (
        <div className="Menu">
            <button className="Button" onClick={onClick}>
                Play Tetris
            </button>
            {timeLeft !== null && <h1>{timeLeft}</h1>}
        </div>
    );
};

export default Menu;
