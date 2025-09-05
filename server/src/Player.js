// have an index of what the next piece will be

// if he needs to punish other players
// maybe call a function from game that will loop into every player and call the function to add an invicible line

export default class Player {
    constructor(socketId, name, currentGame, isHost = false) {
        this.socketId = socketId;
        this.name = name;
        this.isHost = isHost;
        this.currentGame = currentGame;
        this.tetrominoIndex = 0;
    }

    // used to get the next tetromino key that they are at
    getNextTetromino() {
        const key = this.currentGame.tetrominoes.getNextTetromino(
            this.tetrominoIndex
        );
        this.tetrominoIndex += 1;
        return key;
    }

    // placeholder for receiving punishment (e.g., add garbage lines)
    getPunish(lines) {
        // Intentionally no-op for now; tests just assert it's callable
    }

    // when the player completes lines, punish others via the game
    completeLines(linesToPunish) {
        if (this.currentGame && typeof this.currentGame.punishOthers === "function") {
            this.currentGame.punishOthers(this, linesToPunish);
        }
    }
}
