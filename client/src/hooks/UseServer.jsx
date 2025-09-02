import { use } from "react";
import { TETROMINOES } from "../utils/Tetrominoes";
import React, { useState, useCallback, useMemo } from "react";
// here to interact with the server
export const useServerData = () => {
    return [2, 3];
};

// get the next pieces

// use to get the next tetromino - now returns a Promise
export const getNextTetromino = (socket, room) => {
    return new Promise((resolve) => {
        socket.emit(
            "getNextTetrominoes",
            { room: room, socketId: socket.id },
            ({ key }) => {
                const tetromino = TETROMINOES[key];
                resolve(tetromino);
            }
        );
    });
};

export const sendBoard = (socket, room, board) => {
    socket.emit("sendBoard", { room, board });
}


const useOpponentsBoards = (intialboards = new Map()) => {
    const [map, setMap] = useState(intialboards);

    const has = useCallback((key) => {
        return map.has(key);
    }, [map]);

    const get = useCallback((key) => {
        return map.get(key);
    }, [map]);

    const set = useCallback((key, value) => {
        setMap(prev => new Map(prev).set(key, value));
    }, [setMap]);

    const size = useMemo(() => map.size, [map]);

    return {
        map, set, has, get, size,
    };
}


export const getOpponentsBoards = (socket) => {
    const { map, set, has, get, size } = useOpponentsBoards();
    socket.on("BoardOpponents", ({ board, name }) => {
        set(name, board);
    });
    return map;
}
