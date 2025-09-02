import Player from "./Player.js";
import Tetrominoes from "./Tetrominoes.js";
// loop to see when a player is game over

// wait to see when the game starts

export default class Game {
    constructor() {
        this.players = [];
        this.tetrominoes = new Tetrominoes();
        // countdown before the game actually starts (in seconds)
        this.timeLeft = 10; // default value, can be changed before starting
        this.countdownInterval = null;
        this.started = false;
    }

    // add a player that connects themself
    addPlayer(socketId, name) {
        this.players.push(new Player(socketId, name, this));
        console.log(
            "New player list:",
            this.players.map((p) => p.name)
        );
    }

    hasPlayerName(name) {
        return this.players.some((p) => p.name === name);
    }

    getPlayerBySocketId(socketId) {
        return this.players.find((player) => player.socketId == socketId);
    }

    removePlayerSocketId(socketId) {
        this.players.forEach((player, index) => {
            if (player.socketId === socketId) {
                this.players.splice(index, 1);
                console.log("Removed player", player.name);
                console.log(
                    "New player list:",
                    this.players.map((p) => p.name)
                );
            }
        });
    }

    // start the countdown, providing io + room so we can emit updates
    startCountdown(io, room, durationSeconds = 1) {
        if (this.countdownInterval) return; // already running
        this.timeLeft = durationSeconds;
        this.started = false;
        io.to(room).emit("roomCounter", { timeLeft: this.timeLeft });
        console.log("Starting countdown for room:", room);
        this.countdownInterval = setInterval(() => {
            this.timeLeft -= 3;
            if (this.timeLeft > 0) {
                io.to(room).emit("roomCounter", { timeLeft: this.timeLeft });
            } else {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.started = true;
                io.to(room).emit("gameStart");
                console.log("Game start for room:", room);
            }
        }, 1000);
    }

    cancelCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    // loop on all the player and punish them except the punisher
    punishOthers(punisher, linesToPunish) {
        this.players.forEach((player) => {
            if (player.name != punisher) player.getPunish(linesToPunish);
        });
    }
}
