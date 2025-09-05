/**
 * Tetromino list for a game, generate tetrominoes as needed.
 */
export default class Tetrominoes {
    constructor() {
        this.tetrominoKeys = [];
        // Start with one initial random key as tests expect length to be 1
        this.addRandomKey();
    }

    static validKeys() {
        return ["I", "O", "T", "S", "Z", "J", "L"];
    }

    /**
     * Generate a single random tetromino key from valid set.
     */
    randomKey() {
        const keys = Tetrominoes.validKeys();
        const idx = Math.floor(Math.random() * keys.length);
        return keys[idx];
    }

    /**
     * Add a random key to the sequence.
     */
    addRandomKey() {
        this.tetrominoKeys.push(this.randomKey());
    }

    /**
     * Ensure that the array has entries up to the given index (inclusive).
     */
    ensureIndex(index) {
        while (this.tetrominoKeys.length <= index) {
            this.addRandomKey();
        }
    }

    /**
     * Get tetromino at index i and generate until the index needed.
     *
     * @param {number} index Index of the next tetromino.
     * @returns Next tetromino as a letter: "I", "O", "T", "S", "Z", "J", "L"
     */
    getNextTetromino(index) {
        this.ensureIndex(index);
        return this.tetrominoKeys[index];
    }

    /**
     * Get a batch of next tetrominoes starting from index with given count.
     * The same indices should always return the same batch.
     */
    getNextBatch(startIndex, count) {
        this.ensureIndex(startIndex + count - 1);
        return this.tetrominoKeys.slice(startIndex, startIndex + count);
    }
}
