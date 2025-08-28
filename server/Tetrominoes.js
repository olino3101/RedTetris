// have an historic of the next piece that will happens (also copy past from the client tetromino.js all the tetrominoes)

// get random piece (also tetrominoes.jsx)

export default class Tetrominoes {
    constructor() {
        this.tetrominoes = [this.randomTetromino()];
    }

    addRandomTetromino() {
        this.tetrominoes.push(this.randomTetromino);
    }

    randomTetromino() {
        const keys = Object.keys(TETROMINOES);
        const index = Math.floor(Math.random() * keys.length);
        const key = keys[index];
        return TETROMINOES[key];
    }

    getNextTetromino(i) {
        if (i >= tetrominoes.length)
            this.addRandomTetromino();
        return this.tetrominoes[i];
    }
}

const TETROMINOES = {
    I: {
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        className: `${className} ${className}__i`
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        className: `${className} ${className}__o`
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        className: `${className} ${className}__t`
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        className: `${className} ${className}__s`
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        className: `${className} ${className}__z`
    },
    J: {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        className: `${className} ${className}__j`
    },
    L: {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        className: `${className} ${className}__l`
    }
};