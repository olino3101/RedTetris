// have an index of what the next piece will be

// if he needs to punish other players 
// maybe call a function from game that will loop into every player and call the function to add an invicible line

export default class Player {
    constructor(name, isHost, gameManager) {
        this.name = name;
        this.isHost = isHost
        this.gameManager = gameManager;
        this.tetromino_i = 0;
    }


    // when you complete lines you get punish
    completeLines(linesToPunish) {
        this.gameManager.punishOthers(this, linesToPunish);
    }

    // when somebody else finish lines you get punish
    getPunish(linesToPunish) {
    }

    // used to get the next tetrominoes that they are at
    getNextTetromino() {
        this.gameManager.tetrominoes.getNextTetromino(this.tetromino_i);

    }
}