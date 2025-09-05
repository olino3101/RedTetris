import Player from "./Player.js";
import Tetrominoes from "./Tetrominoes.js";
// loop to see when a player is game over

// wait to see when the game starts

export default class Game {
    constructor(room) {
        this.room = room;
        this.players = [];
        this.tetrominoes = new Tetrominoes();

        // Countdown
        this.timeLeft = 10; // initial state before any countdown starts
        this.countdownInterval = null;
        this.started = false;
    }

    // add a player that connects themself
    addPlayer(socketId, name, isHost = false) {
        this.players.push(new Player(socketId, name, this, isHost));
        console.log(
            "New player list:",
            this.players.map((p) => p.name)
        );
    }

    hasPlayerSocketId(socketId) {
        return this.players.some((p) => p.socketId === socketId);
    }

    getPlayerBySocketId(socketId) {
        return this.players.find((player) => player.socketId == socketId);
    }

    removePlayerSocketId(socketId) {
        const playerIndex = this.players.findIndex(
            (player) => player.socketId == socketId
        );
        if (playerIndex !== -1) {
            console.log("Removing player", this.players[playerIndex].socketId);
            this.players.splice(playerIndex, 1);
            console.log(
                "New player list:",
                this.players.map((p) => p.name)
            );
            return;
        }
    }

    setNewHostInGame(exceptPlayer) {
        const newHost = this.players.find((player) => player !== exceptPlayer);

        if (newHost) {
            newHost.isHost = true;
            console.log("New host for the game", this.room, "is", newHost.name);
        } else {
            console.log(
                "No available player to set as host in room",
                this.room
            );
        }
    }

    // Punish every player except the punisher (by name or Player object)
    punishOthers(punisher, linesToPunish) {
        const punisherName =
            typeof punisher === "string" ? punisher : punisher?.name;

        this.players.forEach((player) => {
            // If punisherName is undefined (not found), punish all players
            if (!punisherName || player.name !== punisherName) {
                if (typeof player.getPunish === "function") {
                    player.getPunish(linesToPunish);
                }
            }
        });
    }

    // start the countdown, providing io + room so we can emit updates
    startCountdown(io, room, durationSeconds = 3) {
        if (this.countdownInterval) return; // already running
        this.timeLeft = durationSeconds;
        this.started = false;

        io.to(room).emit("roomCounter", { timeLeft: this.timeLeft });
        console.log("Starting countdown for room:", room);
        this.countdownInterval = setInterval(() => {
            this.timeLeft -= 1;
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
}
