import { TETROMINOES } from "../utils/Tetrominoes";

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

// export const fetchServerData = () => {
//     const [data, setData]
// }
