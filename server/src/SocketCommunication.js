import { Server } from "socket.io";
import { CORS_ORIGIN } from "./env.js";
import Game from "./Game.js";

/**
 * Socket events:
 *  - connection
 *  - ON    joinRoom
 *  - ON    startCountdown
 *  - ON    getNextTetromino
 *  - EMIT  gameAlreadyStarted: { message: "The game has already started !" }
 *  - EMIT  playersUpdate: { players: ["player name", ...] }
 *  - EMIT  roomCounter: { timeLeft: 10 }
 *  - EMIT  gameStart
 */

export default class SocketCommunication {
    constructor(server) {
        this.io = new Server(server, {
            // Caddy "handle_path /api/*" strips the leading /api before proxying,
            // so backend must expose /socket.io (NOT /api/socket.io).
            path: "/socket.io",
            cors: {
                origin: true,
                methods: ["GET", "POST"],
            },
        });

        this.gameMap = new Map();

        this.io.on("connection", (socket) => {
            console.log("[socket] connected:", socket.id);

            // Basic handshake
            socket.emit("welcome", { message: "Welcome to RedTetris server" });

            socket.on("joinRoom", (data) => {
                // Data should be { room, name }
                console.log("Someone is joining a room with data:", data);
                if (!data || !data.room || !data.name) return;
                socket.join(data.room);

                let game = this.gameMap.get(data.room);
                if (!game) {
                    game = new Game(data.room);
                    this.gameMap.set(data.room, game);
                    console.log("New game created with id:", data.room);
                    game.addPlayer(socket.id, data.name, true);
                }
                if (game.started) {
                    socket.emit("gameAlreadyStarted", {
                        message: "The game has already started !",
                    });
                    return;
                }
                if (!game.hasPlayerName(data.name)) {
                    game.addPlayer(socket.id, data.name);
                }

                // Broadcast updated player list (names only)
                this.io.to(data.room).emit("playersUpdate", {
                    players: game.players.map((p) => p.name),
                });

                if (!game.started && game.countdownInterval) {
                    // Send current counter to the new player
                    socket.emit("roomCounter", { timeLeft: game.timeLeft });
                }
            });

            socket.on("startCountdown", (data, ack) => {
                const game = this.gameMap.get(data.room);
                if (!game) {
                    ack({ message: "Game not found." });
                    return;
                }
                const player = game.getPlayerBySocketId(socket.id);
                if (player && player.isHost) {
                    game.startCountdown(this.io, data.room, 3);
                    ack({ message: "Countdown started." });
                } else {
                    ack({
                        message: "Can't start the countdown, you are not host.",
                    });
                }
            });

            socket.on("getNextTetrominoes", (data, ack) => {
                const game = this.gameMap.get(data.room);
                if (!game) return;
                const player = game.getPlayerBySocketId(data.socketId);
                if (!player) return;
                const key = player.getNextTetromino();
                ack({ key });
            });

            socket.on("disconnect", (reason) => {
                const { game, player } = getPlayerInGamesMap(
                    this.gameMap,
                    socket.id
                );
                if (game && player && player.isHost) {
                    game.setNewHostInGame(player);
                }
                removePlayerInGamesBySocketId(this.gameMap, socket.id);
                if (game && game.players.length <= 1) {
                    console.log("Deleting game:", game.room);
                    this.gameMap.delete(game.room);
                    console.log("New game map:", this.gameMap);
                }
                console.log("[socket] disconnected:", socket.id, reason);
            });
        });

        console.log("Created socket communication. Path: /socket.io");
    }

    close() {
        this.io.close(() => {
            console.log("Closing sockets.");
        });
    }
}

function getPlayerInGamesMap(games, socketId) {
    for (const game of games.values()) {
        const player = game.getPlayerBySocketId(socketId);
        if (player !== undefined) {
            return { game, player };
        }
    }

    return { game: undefined, player: undefined };
}

function removePlayerInGamesBySocketId(games, socketId) {
    if (!games) return;
    games.forEach((game, room) => {
        game.removePlayerSocketId(socketId);
        // If room becomes empty, clean it
        if (game.players.length === 0) {
            game.cancelCountdown();
            games.delete(room);
        }
    });
}
