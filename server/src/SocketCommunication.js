import { Server, Socket } from "socket.io";
import Game from "./Game.js";

/**
 * Socket events:
 *  - ON    connection
 *  - ON    joinRoom
 *  - ON    startCountdown
 *  - ON    getNextTetromino
 *  - ON    gameLost
 *  - EMIT  endOfGame
 *  - EMIT  gameAlreadyStarted: { message: "The game has already started !" }
 *  - EMIT  playersUpdate: { players: ["player name", ...] }
 *  - EMIT  roomCounter: { timeLeft: 10 }
 *  - EMIT  gameStart
 */
export default class SocketCommunication {
  constructor(server) {
    this.gameMap = new Map();
    this.io = new Server(server, {
      path: "/api/socket.io",
      cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.io.on("connection", this.onConnection);

    console.log("Created socket communication. Path: /api/socket.io");
  }

  /**
   *
   * @param {Socket} socket
   */
  onConnection = (socket) => {
    console.log("[socket] connected:", socket.id);

    // Emit a welcome message to newly connected clients
    if (typeof socket.emit === "function") {
      socket.emit("welcome", { message: "Welcome to RedTetris server" });
    }

    socket.on("joinRoom", (data) => this.onJoinRoom(socket, data));
    socket.on("startCountdown", (data, ack) =>
      this.onStartCountdown(socket, data, ack)
    );
    socket.on("getNextTetrominoes", (data, ack) =>
      this.onGetNextTetrominoes(socket, data, ack)
    );
    socket.on("sendBoard", (data) => this.onSendBoard(socket, data));
    socket.on("punishOpponents", (data) =>
      this.onPunishOpponents(socket, data)
    );
    socket.on("gameLost", (data) => this.onGameLost(socket, data));
    socket.on("disconnect", (reason) => this.onDisconnect(socket, reason));
  };

  /**
   *
   * @param {Socket} socket
   * @param {{room: number | string, name: string}} data
   */
  onJoinRoom = (socket, data) => {
    if (!data || !data.room || !data.name) return;
    socket.join(data.room);
    var isHost = false;

    let game = this.gameMap.get(data.room);
    if (!game) {
      game = new Game(data.room);
      this.gameMap.set(data.room, game);
      console.log("New game created with id:", data.room);
      isHost = true;
    }
    if (game.started) {
      socket.emit("gameAlreadyStarted", {
        message:
          "The game in this room has already started ! Please reload to try to join again.",
      });
      socket.leave(data.room);
      return;
    }
    if (!game.hasPlayerSocketId(socket.id)) {
      console.log("Someone is joining a room with data:", data);

      // Check if name is already taken by a different socket
      const existingPlayerWithName = game.players.find(
        (p) => p.name === data.name
      );
      if (existingPlayerWithName) {
        // If it's a different socket ID, this could be a reconnection scenario
        // Remove the old player entry to allow reconnection
        console.log(
          "Removing stale player entry for reconnection:",
          existingPlayerWithName.socketId
        );
        game.removePlayerSocketId(existingPlayerWithName.socketId);
      }

      game.addPlayer(socket.id, data.name, isHost);
      // Broadcast updated player list (names only)
      this.io.to(data.room).emit("playersUpdate", {
        players: game.players.map((p) => p.name),
      });
      if (!game.started && game.countdownInterval) {
        // Send current counter to the new player
        socket.emit("roomCounter", { timeLeft: game.timeLeft });
      }
    } else {
      console.log(
        "The player with socket",
        socket.id,
        "is already in the game !"
      );
    }
  };

  /**
   *
   * @param {Socket} socket Current event socket
   * @param {{room: number | string }} data Room number
   * @param {Function} ack Callback for re-emiting data back to the client
   */
  onStartCountdown = (socket, data, ack) => {
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
  };

  /**
   *
   * @param {Socket} socket Current event socket
   * @param {{room: number | string}} data Room number to find the game
   * @param {Function} ack Callback function to send the next tetromino to the client
   */
  onGetNextTetrominoes = (socket, data, ack) => {
    const game = this.gameMap.get(data.room);
    if (!game) return;
    const player = game.getPlayerBySocketId(socket.id);
    if (!player) return;
    const key = player.getNextTetromino();
    ack({ key });
  };

  /**
   *
   * @param {Socket} socket Current event socket
   * @param {{room: number | string}} data Room number to find the game
   */
  onSendBoard = (socket, data) => {
    const game = this.gameMap.get(data.room);
    const board = data.board;
    if (!game) return;
    const name = this.gameMap
      .get(data.room)
      .getPlayerBySocketId(socket.id)?.name;
    socket.to(data.room).emit("BoardOpponents", { board, name });
  };

  /**
   *
   * @param {Socket} socket Current event socket
   * @param {{room: number | string, linesToPunish: number}} data
   * @returns
   */
  onPunishOpponents = (socket, data) => {
    const game = this.gameMap.get(data.room);
    if (!game) return;
    socket
      .to(data.room)
      .emit("punishFromOpponent", { lines: data.linesToPunish });
  };

  /**
   *
   * @param {Socket} socket Current event socket
   * @param {{room: number | string}} data
   */
  onGameLost = (socket, data) => {
    console.log("Game lost for socket", socket.id);
    const game = this.gameMap.get(data.room);
    if (game) {
      game.removePlayerSocketId(socket.id);
      if (game.players.length <= 1) {
        this.io.to(game.room).emit("endOfGame");
        this.gameMap.delete(game.room);
        console.log("END OF GAME FOR ROOM", game.room);
      }
    }
  };

  /**
   * Event on disconnect
   *
   * Will set new host if the disconnected player was host
   *
   * Remove player from games and delete the game if there is no players inside
   *
   * @param {Socket} socket Current event socket
   * @param {string} reason
   */
  onDisconnect = (socket, reason) => {
    const { game, player } = getPlayerInGamesMap(this.gameMap, socket.id);
    if (game && player) {
      // If the disconnecting player was host, set a new host
      if (player.isHost) {
        game.setNewHostInGame(player);
      }

      // Always remove the player when they disconnect
      game.removePlayerSocketId(socket.id);

      // Broadcast updated player list to remaining players
      if (game.players.length > 0) {
        this.io.to(game.room).emit("playersUpdate", {
          players: game.players.map((p) => p.name),
        });
      }

      // If everyone but one player has disconnected, end the game
      if (game.players.length <= 1 && game.started) {
        this.io.to(game.room).emit("endOfGame");
        console.log("Deleting game:", game.room);
        this.gameMap.delete(game.room);
      }
      // Delete game if no players left
      if (game.players.length <= 0) {
        console.log("Deleting game:", game.room);
        this.gameMap.delete(game.room);
      }
    }
    console.log("[socket] disconnected:", socket.id, reason);
  };

  /**
   * Closes all websocket communications
   */
  close() {
    this.io.close();
    console.log("Closing sockets.");
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
  games.forEach((game) => {
    game.removePlayerSocketId(socketId);
    if (game.players.length === 0) {
      game.cancelCountdown();
    }
  });
}
