import { useState, useEffect } from "react";

export const usePunishedLine = (socket) => {
    const [IndestructibleLines, setIndestructibleLines] = useState(0);

    useEffect(() => {
        if (!socket) return;
        const handler = ({ lines }) => {
            setIndestructibleLines((prev) => prev + lines);
        };
        socket.on("punishFromOpponent", handler);
        return () => {
            socket.off("punishFromOpponent", handler);
        };
    }, [socket]);

    return IndestructibleLines;
}
