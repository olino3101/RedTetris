export default class Tetrominoes {
    constructor() {
        this.tetrominoKeys = [];
        this.generateTetrominoesUntil(6);
    }

    generateNewBag() {
        const keys = ["I", "O", "T", "S", "Z", "J", "L"];
        var count = keys.length,
            randomnumber,
            temp;
        while (count) {
            randomnumber = (Math.random() * count--) | 0;
            temp = keys[count];
            keys[count] = keys[randomnumber];
            keys[randomnumber] = temp;
        }
        return keys;
    }

    generateTetrominoesUntil(n) {
        while (n >= this.tetrominoKeys.length) {
            const newBag = this.generateNewBag();
            this.tetrominoKeys.push(...newBag);
        }
    }

    // Get tetromino at index i (and generate if needed)
    getNextTetromino(i) {
        this.generateTetrominoesUntil(i);
        return this.tetrominoKeys[i];
    }
}
