// keep only an history (sequence) of tetromino KEYS ("I","O",...) rather than full shapes
// so we can just send the key to clients (they already know the shapes)

const PIECE_KEYS = ["I", "O", "T", "S", "Z", "J", "L"]; // standard 7-bag could be implemented later

export default class Tetrominoes {
    constructor() {
        // sequence of keys
        this.tetrominoKeys = [this.randomKey()];
    }

    randomKey() {
        const index = Math.floor(Math.random() * PIECE_KEYS.length);
        return PIECE_KEYS[index];
    }

    addRandomKey() {
        this.tetrominoKeys.push(this.randomKey());
    }

    // ensure we have generated up to (and including) index i
    ensureIndex(i) {
        while (i >= this.tetrominoKeys.length) {
            this.addRandomKey();
        }
    }

    // get key at index i (generate if needed)
    getNextTetromino(i) {
        this.ensureIndex(i);
        return this.tetrominoKeys[i];
    }

    // get a batch of upcoming keys
    getNextBatch(startIndex, count) {
        const keys = [];
        for (let i = 0; i < count; i++) {
            keys.push(this.getNextTetromino(startIndex + i));
        }
        return keys;
    }
}
