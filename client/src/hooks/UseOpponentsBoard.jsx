import { useState, useCallback, useEffect } from "react";


export const useOpponentsBoards = (intialboards = new Map()) => {
    const [map, setMap] = useState(intialboards);

    const set = useCallback((key, value) => {
        setMap(prev => new Map(prev).set(key, value));
    }, [setMap]);

    return { map, set };
}

export const useOpponentsBoardsFromSocket = (socket, intialboards = new Map()) => {
    const { map, set } = useOpponentsBoards(intialboards);

    useEffect(() => {
        if (!socket) return;
        const handler = ({ board, name }) => {
            set(name, board);
        };
        socket.on("BoardOpponents", handler);
        return () => {
            socket.off("BoardOpponents", handler);
        };
    }, [socket, set]);

    return map;
}



