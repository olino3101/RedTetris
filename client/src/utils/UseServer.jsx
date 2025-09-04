import { useOpponentsBoardsFromSocket } from "../hooks/UseOpponentsBoard";
import { TETROMINOES } from "./Tetrominoes";

export const getOpponentsBoards = (socket) => {
    return useOpponentsBoardsFromSocket(socket);
}

export const sendBoard = (socket, room, board) => {
    socket.emit("sendBoard", { room, board });
}

export const getNextTetromino = (socket, room) => {
    return new Promise((resolve) => {
        socket.emit(
            "getNextTetrominoes",
            { room: room },
            ({ key }) => {
                const tetromino = TETROMINOES[key];
                resolve(tetromino);
            }
        );
    });
};

export const punishOther = (linesToPunish, socket, room) => {
    socket.emit("punishOpponents", { linesToPunish, room });
}
