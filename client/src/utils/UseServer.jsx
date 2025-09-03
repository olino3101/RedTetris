import { useOpponentsBoards } from "../hooks/UseOpponentsBoard";
import { TETROMINOES } from "./Tetrominoes";

export const getOpponentsBoards = (socket) => {
    const { map, set } = useOpponentsBoards();
    socket.on("BoardOpponents", ({ board, name }) => {
        set(name, board);
    });
    return map;
}

export const sendBoard = (socket, room, board) => {
    socket.emit("sendBoard", { room, board });
}

export const getNextTetromino = (socket, room) => {
    return new Promise((resolve) => {
        socket.emit(
            "getNextTetrominoes",
            { room: room, socketId: socket.id },
            ({ key }) => {
                const tetromino = TETROMINOES["O"];
                resolve(tetromino);
            }
        );
    });
};

export const punishOther = (linesToPunish, socket, room) => {
    debugger
    socket.emit("punishOpponents", { linesToPunish, room });
}