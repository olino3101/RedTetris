// have an index of what the next piece will be

// if he needs to punish other players
// maybe call a function from game that will loop into every player and call the function to add an invicible line

export default class Player {
    constructor(socketId, name, currentGame) {
        this.socketId = socketId;
        this.name = name;
        this.currentGame = currentGame;
        this.tetrominoIndex = 0;
    }

    // when you complete lines you get punish
    completeLines(linesToPunish) {
        this.currentGame.punishOthers(this, linesToPunish);
    }

    // when somebody else finish lines you get punish
    getPunish(linesToPunish) {}

    // used to get the next tetromino key that they are at
    getNextTetromino() {
        const key = this.currentGame.tetrominoes.getNextTetromino(
            this.tetrominoIndex
        );
        this.tetrominoIndex += 1;
        return key;
    }
}
