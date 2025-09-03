/**
 * Tetromino list for a game, generate tetrominoes as needed.
 */
export default class Tetrominoes {
    constructor() {
        this.tetrominoKeys = [];
        this.generateTetrominoesUntil(6);
    }

    /**
     * Generate a "bag" of 7 tetrominoes like the real game.
     *
     * A tetromino is represented by one of theses letters:
     * "I", "O", "T", "S", "Z", "J", "L"
     *
     * @returns Bag of tetrominoes (list of letter)
     */
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

    /**
     * Generate bags of 7 tetrominoes until the index is reachable.
     *
     * @param {number} index The index needed, will generate until reachable.
     */
    generateTetrominoesUntil(index) {
        while (index >= this.tetrominoKeys.length) {
            const newBag = this.generateNewBag();
            this.tetrominoKeys.push(...newBag);
        }
    }

    /**
     * Get tetromino at index i and generate until the index needed.
     *
     * @param {number} i Index of the next tetromino.
     * @returns Next tetromino as a letter: "I", "O", "T", "S", "Z", "J", "L"
     */
    getNextTetromino(index) {
        this.generateTetrominoesUntil(index);
        return this.tetrominoKeys[index];
    }
}
