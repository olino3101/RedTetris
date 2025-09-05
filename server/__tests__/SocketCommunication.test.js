import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import SocketCommunication from "../src/SocketCommunication.js";
import { Server } from "socket.io";
import { createServer } from "http";

// Mock the env module
jest.mock("../src/env.js", () => ({
  CORS_ORIGIN: "*",
}));

describe("SocketCommunication", () => {
  let httpServer;
  let socketCommunication;
  let mockSocket;

  beforeEach(() => {
    httpServer = createServer();
    socketCommunication = new SocketCommunication(httpServer);

    // Mock socket
    mockSocket = {
      id: "socket123",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    // Clean up any games and their intervals
    if (socketCommunication && socketCommunication.gameMap) {
      socketCommunication.gameMap.forEach((game) => {
        if (game.cancelCountdown) {
          game.cancelCountdown();
        }
      });
      socketCommunication.gameMap.clear();
    }

    if (socketCommunication) {
      socketCommunication.close();
    }
    httpServer.close();
  });

  test("should create SocketCommunication instance", () => {
    expect(socketCommunication).toBeDefined();
    expect(socketCommunication.io).toBeInstanceOf(Server);
    expect(socketCommunication.gameMap).toBeInstanceOf(Map);
    expect(socketCommunication.gameMap.size).toBe(0);
  });

  test("should initialize with correct socket.io configuration", () => {
    // Check that the server was created with correct options
    expect(socketCommunication.io.path()).toBe("/api/socket.io");
  });

  test("should handle socket connection", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    // Simulate connection event
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    expect(consoleSpy).toHaveBeenCalledWith("[socket] connected:", "socket123");
    expect(mockSocket.emit).toHaveBeenCalledWith("welcome", {
      message: "Welcome to RedTetris server",
    });

    consoleSpy.mockRestore();
  });

  test("should register socket event handlers on connection", () => {
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // Verify that event handlers are registered
    expect(mockSocket.on).toHaveBeenCalledWith(
      "joinRoom",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "startCountdown",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "getNextTetrominoes",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "sendBoard",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "gameLost",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function)
    );
  });

  test("should handle joinRoom event with valid data", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // Get the joinRoom handler
    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];

    const roomData = { room: "testRoom", name: "TestPlayer" };
    joinRoomHandler(roomData);

    expect(mockSocket.join).toHaveBeenCalledWith("testRoom");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Someone is joining a room with data:",
      roomData
    );
    expect(socketCommunication.gameMap.has("testRoom")).toBe(true);

    consoleSpy.mockRestore();
  });

  test("should ignore joinRoom event with invalid data", () => {
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];

    // Test with missing room
    joinRoomHandler({ name: "TestPlayer" });
    expect(mockSocket.join).not.toHaveBeenCalled();

    // Test with missing name
    joinRoomHandler({ room: "testRoom" });
    expect(mockSocket.join).not.toHaveBeenCalled();

    // Test with null data
    joinRoomHandler(null);
    expect(mockSocket.join).not.toHaveBeenCalled();
  });

  test("should create new game when joining non-existent room", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];

    const roomData = { room: "newRoom", name: "FirstPlayer" };
    joinRoomHandler(roomData);

    expect(socketCommunication.gameMap.has("newRoom")).toBe(true);
    const game = socketCommunication.gameMap.get("newRoom");
    expect(game.room).toBe("newRoom");
    expect(game.players).toHaveLength(1);
    expect(game.players[0].name).toBe("FirstPlayer");
    expect(game.players[0].isHost).toBe(true); // First player should be host

    consoleSpy.mockRestore();
  });

  test("should handle joining existing room", () => {
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];

    // Create first player (host)
    const firstPlayerData = { room: "existingRoom", name: "Host" };
    joinRoomHandler(firstPlayerData);

    // Create second socket for second player
    const mockSocket2 = {
      id: "socket456",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    };

    // Simulate second player joining
    connectionHandler(mockSocket2);
    const joinRoomCall2 = mockSocket2.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler2 = joinRoomCall2[1];

    const secondPlayerData = { room: "existingRoom", name: "Player2" };
    joinRoomHandler2(secondPlayerData);

    const game = socketCommunication.gameMap.get("existingRoom");
    expect(game.players).toHaveLength(2);
    expect(game.players[0].isHost).toBe(true);
    expect(game.players[1].isHost).toBe(false);
  });

  test("should handle getNextTetrominoes event", () => {
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // First join a room
    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];
    joinRoomHandler({ room: "testRoom", name: "TestPlayer" });

    // Get the getNextTetrominoes handler
    const getTetrominoCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "getNextTetrominoes"
    );
    const getTetrominoHandler = getTetrominoCall[1];

    const mockAck = jest.fn();
    getTetrominoHandler({ room: "testRoom", socketId: "socket123" }, mockAck);

    // Should call ack with key
    expect(mockAck).toHaveBeenCalledWith({ key: expect.any(String) });
  });

  test("should handle disconnect event", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // First join a room
    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];
    joinRoomHandler({ room: "testRoom", name: "TestPlayer" });

    // Get the disconnect handler
    const disconnectCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "disconnect"
    );
    const disconnectHandler = disconnectCall[1];

    disconnectHandler("client namespace disconnect");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[socket] disconnected:",
      "socket123",
      "client namespace disconnect"
    );

    consoleSpy.mockRestore();
  });

  test("should handle startCountdown event", () => {
    const connectionHandler = socketCommunication.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // First join a room as host
    const joinRoomCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "joinRoom"
    );
    const joinRoomHandler = joinRoomCall[1];
    joinRoomHandler({ room: "testRoom", name: "HostPlayer" });

    // Mock the io.to method for testing
    const mockIoTo = jest.fn().mockReturnValue({
      emit: jest.fn(),
    });
    socketCommunication.io.to = mockIoTo;

    // Get the startCountdown handler
    const startCountdownCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "startCountdown"
    );
    const startCountdownHandler = startCountdownCall[1];

    const mockAck = jest.fn();
    startCountdownHandler({ room: "testRoom" }, mockAck);

    // Should acknowledge with success message
    expect(mockAck).toHaveBeenCalledWith({ message: "Countdown started." });

    // Game should start countdown
    const game = socketCommunication.gameMap.get("testRoom");
    expect(game.countdownInterval).not.toBeNull();
  });

  test("should close socket communication", () => {
    const closeSpy = jest.spyOn(socketCommunication.io, "close");

    socketCommunication.close();

    expect(closeSpy).toHaveBeenCalled();
  });
});

// Test utility functions
describe("SocketCommunication utility functions", () => {
  let gameMap;
  let mockGame1;
  let mockGame2;

  beforeEach(() => {
    gameMap = new Map();

    mockGame1 = {
      room: "room1",
      players: [
        { socketId: "socket1", name: "Player1" },
        { socketId: "socket2", name: "Player2" },
      ],
      getPlayerBySocketId: jest.fn(),
      removePlayerSocketId: jest.fn(),
      setNewHostInGame: jest.fn(),
      cancelCountdown: jest.fn(),
    };

    mockGame2 = {
      room: "room2",
      players: [{ socketId: "socket3", name: "Player3" }],
      getPlayerBySocketId: jest.fn(),
      removePlayerSocketId: jest.fn(),
      setNewHostInGame: jest.fn(),
      cancelCountdown: jest.fn(),
    };

    gameMap.set("room1", mockGame1);
    gameMap.set("room2", mockGame2);
  });

  test("getPlayerInGamesMap should find player in games", () => {
    // Import the module to get access to utility functions
    // Since they're not exported, we'll need to test them through the class
    const httpServer = createServer();
    const socketComm = new SocketCommunication(httpServer);

    // Set up mock to return player
    mockGame1.getPlayerBySocketId.mockReturnValue(mockGame1.players[0]);
    mockGame2.getPlayerBySocketId.mockReturnValue(undefined);

    // We can't directly test the utility function, but we can test the behavior
    // through the disconnect handler
    const mockSocket = {
      id: "socket1",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };

    const connectionHandler = socketComm.io.listeners("connection")[0];
    connectionHandler(mockSocket);

    // Add the games to the socketComm gameMap
    socketComm.gameMap.set("room1", mockGame1);
    socketComm.gameMap.set("room2", mockGame2);

    const disconnectCall = mockSocket.on.mock.calls.find(
      (call) => call[0] === "disconnect"
    );
    const disconnectHandler = disconnectCall[1];

    // Mock the game to find the player
    mockGame1.getPlayerBySocketId.mockImplementation((id) =>
      id === "socket1"
        ? { socketId: "socket1", name: "Player1", isHost: true }
        : undefined
    );

    disconnectHandler();

    // Verify that removePlayerSocketId was called
    expect(mockGame1.removePlayerSocketId).toHaveBeenCalledWith("socket1");

    httpServer.close();
    socketComm.close();
  });
});

// Additional tests for better coverage
describe("SocketCommunication edge cases", () => {
  let httpServer;
  let socketCommunication;
  let mockSocket;

  beforeEach(() => {
    httpServer = createServer();
    socketCommunication = new SocketCommunication(httpServer);

    // Mock socket
    mockSocket = {
      id: "socket123",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    // Clean up any games and their intervals
    if (socketCommunication && socketCommunication.gameMap) {
      socketCommunication.gameMap.forEach((game) => {
        if (game.cancelCountdown) {
          game.cancelCountdown();
        }
      });
      socketCommunication.gameMap.clear();
    }

    if (socketCommunication) {
      socketCommunication.close();
    }
    httpServer.close();
  });

  describe("onJoinRoom edge cases", () => {
    test("should handle invalid data", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const joinRoomCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "joinRoom"
      );
      const joinRoomHandler = joinRoomCall[1];

      // Test with null data
      joinRoomHandler(null);
      expect(mockSocket.join).not.toHaveBeenCalled();

      // Test with missing room
      joinRoomHandler({ name: "Player1" });
      expect(mockSocket.join).not.toHaveBeenCalled();

      // Test with missing name
      joinRoomHandler({ room: "testRoom" });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    test("should handle game already started", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      // Create a started game
      const startedGame = {
        room: "startedRoom",
        started: true,
        players: [],
        addPlayer: jest.fn(),
        hasPlayerSocketId: jest.fn().mockReturnValue(false),
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("startedRoom", startedGame);

      const joinRoomCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "joinRoom"
      );
      const joinRoomHandler = joinRoomCall[1];

      mockSocket.leave = jest.fn();

      joinRoomHandler({ room: "startedRoom", name: "Player1" });

      expect(mockSocket.emit).toHaveBeenCalledWith("gameAlreadyStarted", {
        message:
          "The game in this room has already started ! Please reload to try to join again.",
      });
      expect(mockSocket.leave).toHaveBeenCalledWith("startedRoom");
    });

    test("should handle name reconnection scenario", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      // Create a game with existing player
      const gameWithPlayer = {
        room: "testRoom",
        started: false,
        players: [{ name: "ExistingPlayer", socketId: "other" }],
        addPlayer: jest.fn(),
        hasPlayerSocketId: jest.fn().mockReturnValue(false),
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithPlayer);

      const joinRoomCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "joinRoom"
      );
      const joinRoomHandler = joinRoomCall[1];

      joinRoomHandler({ room: "testRoom", name: "ExistingPlayer" });

      // Should remove the old player entry and add the new one (reconnection)
      expect(gameWithPlayer.removePlayerSocketId).toHaveBeenCalledWith("other");
      expect(gameWithPlayer.addPlayer).toHaveBeenCalledWith(
        "socket123",
        "ExistingPlayer",
        false
      );

      consoleSpy.mockRestore();
    });

    test("should handle player already in game", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      // Create a game where player is already present
      const gameWithExistingPlayer = {
        room: "testRoom",
        started: false,
        players: [{ name: "Player1", socketId: "socket123" }],
        addPlayer: jest.fn(),
        hasPlayerSocketId: jest.fn().mockReturnValue(true),
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithExistingPlayer);

      const joinRoomCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "joinRoom"
      );
      const joinRoomHandler = joinRoomCall[1];

      joinRoomHandler({ room: "testRoom", name: "Player1" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "The player with socket",
        "socket123",
        "is already in the game !"
      );
      expect(gameWithExistingPlayer.addPlayer).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should send room counter to new player during countdown", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      // Create a game with active countdown
      const gameInCountdown = {
        room: "countdownRoom",
        started: false,
        countdownInterval: setInterval(() => {}, 1000), // Active countdown
        timeLeft: 5,
        players: [],
        addPlayer: jest.fn(),
        hasPlayerSocketId: jest.fn().mockReturnValue(false),
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      gameInCountdown.players.map = jest.fn().mockReturnValue(["Player1"]);

      socketCommunication.gameMap.set("countdownRoom", gameInCountdown);
      socketCommunication.io.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });

      const joinRoomCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "joinRoom"
      );
      const joinRoomHandler = joinRoomCall[1];

      joinRoomHandler({ room: "countdownRoom", name: "Player1" });

      expect(gameInCountdown.addPlayer).toHaveBeenCalledWith(
        "socket123",
        "Player1",
        false
      );
      expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
        timeLeft: 5,
      });

      // Clean up
      clearInterval(gameInCountdown.countdownInterval);
    });
  });

  describe("onSendBoard edge cases", () => {
    test("should handle missing game", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const sendBoardCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "sendBoard"
      );
      const sendBoardHandler = sendBoardCall[1];

      // No game exists
      sendBoardHandler({ room: "nonexistentRoom", board: [] });

      // Should not crash or emit anything
      expect(mockSocket.to).not.toHaveBeenCalled();
    });

    test("should handle missing player in game", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithoutPlayer = {
        room: "testRoom",
        getPlayerBySocketId: jest.fn().mockReturnValue(undefined),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithoutPlayer);

      const sendBoardCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "sendBoard"
      );
      const sendBoardHandler = sendBoardCall[1];

      mockSocket.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });

      sendBoardHandler({ room: "testRoom", board: [] });

      expect(mockSocket.to).toHaveBeenCalledWith("testRoom");
    });
  });

  describe("onPunishOpponents edge cases", () => {
    test("should handle missing game", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const punishCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "punishOpponents"
      );
      const punishHandler = punishCall[1];

      // No game exists
      punishHandler({ room: "nonexistentRoom", linesToPunish: 2 });

      // Should not crash or emit anything
      expect(mockSocket.to).not.toHaveBeenCalled();
    });
  });

  describe("onGameLost edge cases", () => {
    test("should handle game with multiple players remaining", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithMultiplePlayers = {
        room: "multiPlayerRoom",
        players: [
          { name: "Player1", socketId: "socket1" },
          { name: "Player2", socketId: "socket2" },
          { name: "Player3", socketId: "socket3" },
        ],
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set(
        "multiPlayerRoom",
        gameWithMultiplePlayers
      );

      const gameLostCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "gameLost"
      );
      const gameLostHandler = gameLostCall[1];

      gameLostHandler({ room: "multiPlayerRoom" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Game lost for socket",
        "socket123"
      );
      // Game should not be deleted as there are still multiple players
      expect(socketCommunication.gameMap.has("multiPlayerRoom")).toBe(true);

      consoleSpy.mockRestore();
    });

    test("should handle game with one player remaining", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithOnePlayer = {
        room: "singlePlayerRoom",
        players: [{ name: "LastPlayer", socketId: "socket123" }],
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("singlePlayerRoom", gameWithOnePlayer);
      socketCommunication.io.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });

      const gameLostCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "gameLost"
      );
      const gameLostHandler = gameLostCall[1];

      gameLostHandler({ room: "singlePlayerRoom" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Game lost for socket",
        "socket123"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "END OF GAME FOR ROOM",
        "singlePlayerRoom"
      );

      consoleSpy.mockRestore();
    });

    test("should handle missing game", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameLostCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "gameLost"
      );
      const gameLostHandler = gameLostCall[1];

      gameLostHandler({ room: "nonexistentRoom" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Game lost for socket",
        "socket123"
      );
      // Should not crash

      consoleSpy.mockRestore();
    });
  });

  describe("onDisconnect edge cases", () => {
    test("should handle disconnect with started game", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const startedGameWithPlayer = {
        room: "startedGameRoom",
        started: true,
        players: [{ name: "Player1", socketId: "socket123", isHost: true }],
        getPlayerBySocketId: jest.fn().mockReturnValue({
          name: "Player1",
          socketId: "socket123",
          isHost: true,
        }),
        removePlayerSocketId: jest.fn(),
        setNewHostInGame: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      // After player removal, game should have 0 players
      startedGameWithPlayer.removePlayerSocketId.mockImplementation(() => {
        startedGameWithPlayer.players = [];
      });

      socketCommunication.gameMap.set("startedGameRoom", startedGameWithPlayer);
      socketCommunication.io.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });

      const disconnectCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      );
      const disconnectHandler = disconnectCall[1];

      disconnectHandler("client disconnect");

      expect(startedGameWithPlayer.setNewHostInGame).toHaveBeenCalled();
      expect(socketCommunication.io.to).toHaveBeenCalledWith("startedGameRoom");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Deleting game:",
        "startedGameRoom"
      );

      consoleSpy.mockRestore();
    });

    test("should handle disconnect with no game/player found", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const disconnectCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      );
      const disconnectHandler = disconnectCall[1];

      disconnectHandler("no game disconnect");

      expect(consoleSpy).toHaveBeenCalledWith(
        "[socket] disconnected:",
        "socket123",
        "no game disconnect"
      );
      // Should not crash

      consoleSpy.mockRestore();
    });
  });

  describe("onGetNextTetrominoes edge cases", () => {
    test("should handle missing game", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const getNextCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "getNextTetrominoes"
      );
      const getNextHandler = getNextCall[1];

      const mockAck = jest.fn();

      getNextHandler({ room: "nonexistentRoom" }, mockAck);

      // Should not call ack or crash
      expect(mockAck).not.toHaveBeenCalled();
    });

    test("should handle missing player", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithoutPlayer = {
        room: "testRoom",
        getPlayerBySocketId: jest.fn().mockReturnValue(undefined),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithoutPlayer);

      const getNextCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "getNextTetrominoes"
      );
      const getNextHandler = getNextCall[1];

      const mockAck = jest.fn();

      getNextHandler({ room: "testRoom" }, mockAck);

      // Should not call ack or crash
      expect(mockAck).not.toHaveBeenCalled();
    });
  });

  describe("onStartCountdown edge cases", () => {
    test("should handle missing game", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const startCountdownCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "startCountdown"
      );
      const startCountdownHandler = startCountdownCall[1];

      const mockAck = jest.fn();

      startCountdownHandler({ room: "nonexistentRoom" }, mockAck);

      expect(mockAck).toHaveBeenCalledWith({ message: "Game not found." });
    });

    test("should handle non-host player trying to start countdown", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithNonHost = {
        room: "testRoom",
        players: [{ name: "Player1", socketId: "socket123", isHost: false }],
        getPlayerBySocketId: jest.fn().mockReturnValue({
          name: "Player1",
          socketId: "socket123",
          isHost: false,
        }),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithNonHost);

      const startCountdownCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "startCountdown"
      );
      const startCountdownHandler = startCountdownCall[1];

      const mockAck = jest.fn();

      startCountdownHandler({ room: "testRoom" }, mockAck);

      expect(mockAck).toHaveBeenCalledWith({
        message: "Can't start the countdown, you are not host.",
      });
    });
  });

  describe("onPunishOpponents with real socket behavior", () => {
    test("should emit punish event to room", () => {
      const connectionHandler =
        socketCommunication.io.listeners("connection")[0];
      connectionHandler(mockSocket);

      const gameWithPlayer = {
        room: "testRoom",
        players: [{ name: "Player1", socketId: "socket123" }],
        getPlayerBySocketId: jest.fn(),
        removePlayerSocketId: jest.fn(),
        cancelCountdown: jest.fn(),
      };

      socketCommunication.gameMap.set("testRoom", gameWithPlayer);

      const punishCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === "punishOpponents"
      );
      const punishHandler = punishCall[1];

      // Mock the socket.to().emit() chain
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      mockSocket.to = mockTo;

      punishHandler({ room: "testRoom", linesToPunish: 3 });

      expect(mockTo).toHaveBeenCalledWith("testRoom");
      expect(mockEmit).toHaveBeenCalledWith("punishFromOpponent", { lines: 3 });
    });
  });
});
