import {
    describe,
    test,
    expect,
    beforeEach,
    afterEach,
    jest,
} from "@jest/globals";
import Game from "../src/Game.js";

describe("Game", () => {
    let game;
    let mockIo;
    let mockSocket;

    beforeEach(() => {
        jest.useFakeTimers();

        game = new Game("testRoom");

        mockSocket = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        mockIo = {
            to: jest.fn().mockReturnValue(mockSocket),
        };
    });

    afterEach(() => {
        jest.useRealTimers();
        if (game.countdownInterval) {
            game.cancelCountdown();
        }
    });

    test("should create game with correct initial state", () => {
        expect(game.room).toBe("testRoom");
        expect(game.players).toEqual([]);
        expect(game.tetrominoes).toBeDefined();
        expect(game.timeLeft).toBe(10);
        expect(game.countdownInterval).toBeNull();
        expect(game.started).toBe(false);
    });

    test("should add players correctly", () => {
        game.addPlayer("socket1", "Player1", false);
        game.addPlayer("socket2", "Player2", true);

        expect(game.players).toHaveLength(2);
        expect(game.players[0].socketId).toBe("socket1");
        expect(game.players[0].name).toBe("Player1");
        expect(game.players[0].isHost).toBe(false);
        expect(game.players[1].socketId).toBe("socket2");
        expect(game.players[1].name).toBe("Player2");
        expect(game.players[1].isHost).toBe(true);
    });

    test("should get player by socket ID", () => {
        game.addPlayer("socket1", "Player1");
        game.addPlayer("socket2", "Player2");

        const player1 = game.getPlayerBySocketId("socket1");
        const player2 = game.getPlayerBySocketId("socket2");
        const nonExistent = game.getPlayerBySocketId("socket3");

        expect(player1.name).toBe("Player1");
        expect(player2.name).toBe("Player2");
        expect(nonExistent).toBeUndefined();
    });

    test("should remove player by socket ID", () => {
        game.addPlayer("socket1", "Player1");
        game.addPlayer("socket2", "Player2");
        game.addPlayer("socket3", "Player3");

        expect(game.players).toHaveLength(3);

        game.removePlayerSocketId("socket2");
        expect(game.players).toHaveLength(2);
        expect(game.getPlayerBySocketId("socket2")).toBeUndefined();
        expect(game.getPlayerBySocketId("socket1")).toBeDefined();
        expect(game.getPlayerBySocketId("socket3")).toBeDefined();
    });

    test("should handle removing non-existent player", () => {
        game.addPlayer("socket1", "Player1");
        expect(game.players).toHaveLength(1);

        game.removePlayerSocketId("nonExistent");
        expect(game.players).toHaveLength(1);
    });

    test("should set new host when current host leaves", () => {
        game.addPlayer("socket1", "Player1", true); // host
        game.addPlayer("socket2", "Player2", false);
        game.addPlayer("socket3", "Player3", false);

        const currentHost = game.players[0];
        expect(currentHost.isHost).toBe(true);

        game.setNewHostInGame(currentHost);

        const newHost = game.players.find((p) => p.isHost && p !== currentHost);
        expect(newHost).toBeDefined();
        expect(newHost.isHost).toBe(true);
    });

    test("should handle setting new host when no other players", () => {
        game.addPlayer("socket1", "Player1", true);
        const onlyPlayer = game.players[0];

        // Should not throw when no other players available
        expect(() => game.setNewHostInGame(onlyPlayer)).not.toThrow();
    });

    test("should start countdown with default duration", () => {
        game.startCountdown(mockIo, "testRoom");

        expect(game.timeLeft).toBe(3); // default duration
        expect(mockIo.to).toHaveBeenCalledWith("testRoom");
        expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
            timeLeft: 3,
        });
        expect(game.countdownInterval).not.toBeNull();
    });

    test("should start countdown with custom duration", () => {
        game.startCountdown(mockIo, "testRoom", 5);

        expect(game.timeLeft).toBe(5);
        expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
            timeLeft: 5,
        });
    });

    test("should not start countdown if already running", () => {
        game.startCountdown(mockIo, "testRoom", 3);
        const firstInterval = game.countdownInterval;

        game.startCountdown(mockIo, "testRoom", 5);
        expect(game.countdownInterval).toBe(firstInterval);
        expect(game.timeLeft).toBe(3); // Should not change
    });

    test("should countdown and emit updates", () => {
        game.startCountdown(mockIo, "testRoom", 3);

        // Initial emit
        expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
            timeLeft: 3,
        });

        // Advance 1 second
        jest.advanceTimersByTime(1000);
        expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
            timeLeft: 2,
        });

        // Advance another second
        jest.advanceTimersByTime(1000);
        expect(mockSocket.emit).toHaveBeenCalledWith("roomCounter", {
            timeLeft: 1,
        });

        // Final countdown should emit gameStart
        jest.advanceTimersByTime(1000);
        expect(mockSocket.emit).toHaveBeenCalledWith("gameStart");
        expect(game.started).toBe(true);
        expect(game.countdownInterval).toBeNull();
    });

    test("should cancel countdown", () => {
        game.startCountdown(mockIo, "testRoom", 5);
        expect(game.countdownInterval).not.toBeNull();

        game.cancelCountdown();
        expect(game.countdownInterval).toBeNull();

        // Timer should not continue
        jest.advanceTimersByTime(6000);
        expect(game.started).toBe(false);
    });

    test("should cancel countdown when no interval exists", () => {
        expect(game.countdownInterval).toBeNull();
        expect(() => game.cancelCountdown()).not.toThrow();
        expect(game.countdownInterval).toBeNull();
    });

    test("should punish other players except punisher", () => {
        game.addPlayer("socket1", "Player1");
        game.addPlayer("socket2", "Player2");
        game.addPlayer("socket3", "Player3");

        const punisher = game.players[1]; // Player2
        const spy1 = jest.spyOn(game.players[0], "getPunish");
        const spy2 = jest.spyOn(game.players[1], "getPunish");
        const spy3 = jest.spyOn(game.players[2], "getPunish");

        game.punishOthers("Player2", 3);

        expect(spy1).toHaveBeenCalledWith(3); // Player1 should be punished
        expect(spy2).not.toHaveBeenCalled(); // Player2 (punisher) should not be punished
        expect(spy3).toHaveBeenCalledWith(3); // Player3 should be punished
    });

    test("should handle punish when punisher name does not exist", () => {
        game.addPlayer("socket1", "Player1");
        game.addPlayer("socket2", "Player2");

        const spy1 = jest.spyOn(game.players[0], "getPunish");
        const spy2 = jest.spyOn(game.players[1], "getPunish");

        game.punishOthers("NonExistentPlayer", 2);

        // All players should be punished since punisher doesn't exist
        expect(spy1).toHaveBeenCalledWith(2);
        expect(spy2).toHaveBeenCalledWith(2);
    });
});
