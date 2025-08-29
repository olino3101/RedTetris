import { TETROMINOES } from "/src/utils/Tetrominoes";
import { useState } from "react";


// here to interact with the server
export const useServerData = () => {
    return [2, 3];
};

// get the next pieces



// use to get the next tetromino
export const getNextTetromino = () => {
    return TETROMINOES.I;
}

// export const fetchServerData = () => {
//     const [data, setData]
// }