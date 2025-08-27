import { TETROMINOES } from "/src/utils/Tetrominoes";



// here to interact with the server
export const useServerData = () => {
    return [2, 3];
};

// get the next pieces

// send when clearing lines
export const punishOther = () => {
    return;
};

// use to get the next tetromino
export const getNextTetromino = () => {
    return TETROMINOES.I;
}