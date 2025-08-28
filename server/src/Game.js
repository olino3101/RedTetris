import Player from "./Player";
import Tetrominoes from "./Tetrominoes"
// loop to see when a player is game over

// wait to see when the game starts

class Game {
    constructor(id) {
        this.players = [Player(id, true, this)]
        this.tetrominoes = Tetrominoes();
    }

    // add a player that connects themself
    addPlayer(id) {
        this.players.push(Player(id, false, this))
    }

    // loop on all the player and punish them except the punisher
    punishOthers(punisher, linesToPunish) {
        this.players.forEach((player) => {
            if (player.id != punisher)
                player.getPunish(linesToPunish);
        })
    }

}
