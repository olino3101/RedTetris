import { useState, useEffect } from "react";

export const usePunishedLine = (socket) => {
    const [IndestructibleLines, setIndestructibleLines] = useState(0);
    socket.on("punishFromOpponent", ({ lines }) => {
        setIndestructibleLines(IndestructibleLines + lines);
    });
    return IndestructibleLines;
}
