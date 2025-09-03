import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import Player from "../src/Player.js";
import Game from "../src/Game.js";

describe("Player", () => {
    let player;
    let mockGame;

    beforeEach(() => {
        // Create a mock game object
        mockGame = {
            punishOthers: jest.fn(),
            tetrominoes: {
                getNextTetromino: jest.fn().mockReturnValue("I"),
            },
        };

        player = new Player("socket123", "TestPlayer", mockGame, false);
    });

    test("should create player with correct properties", () => {
        expect(player.socketId).toBe("socket123");
        expect(player.name).toBe("TestPlayer");
        expect(player.isHost).toBe(false);
        expect(player.currentGame).toBe(mockGame);
        expect(player.tetrominoIndex).toBe(0);
    });

    test("should create host player when isHost is true", () => {
        const hostPlayer = new Player(
            "socket456",
            "HostPlayer",
            mockGame,
            true
        );

        expect(hostPlayer.isHost).toBe(true);
        expect(hostPlayer.socketId).toBe("socket456");
        expect(hostPlayer.name).toBe("HostPlayer");
    });

    test("should use default isHost value when not provided", () => {
        const defaultPlayer = new Player(
            "socket789",
            "DefaultPlayer",
            mockGame
        );

        expect(defaultPlayer.isHost).toBe(false);
        expect(defaultPlayer.socketId).toBe("socket789");
        expect(defaultPlayer.name).toBe("DefaultPlayer");
    });

    test("should call punishOthers when completing lines", () => {
        const linesToPunish = 2;

        player.completeLines(linesToPunish);

        expect(mockGame.punishOthers).toHaveBeenCalledWith(
            player,
            linesToPunish
        );
        expect(mockGame.punishOthers).toHaveBeenCalledTimes(1);
    });

    test("should handle getPunish method", () => {
        // Currently getPunish is empty, but we test it exists and doesn't throw
        expect(() => player.getPunish(3)).not.toThrow();
    });

    test("should get next tetromino and increment index", () => {
        mockGame.tetrominoes.getNextTetromino
            .mockReturnValueOnce("I")
            .mockReturnValueOnce("O")
            .mockReturnValueOnce("T");

        expect(player.tetrominoIndex).toBe(0);

        const first = player.getNextTetromino();
        expect(first).toBe("I");
        expect(player.tetrominoIndex).toBe(1);
        expect(mockGame.tetrominoes.getNextTetromino).toHaveBeenCalledWith(0);

        const second = player.getNextTetromino();
        expect(second).toBe("O");
        expect(player.tetrominoIndex).toBe(2);
        expect(mockGame.tetrominoes.getNextTetromino).toHaveBeenCalledWith(1);

        const third = player.getNextTetromino();
        expect(third).toBe("T");
        expect(player.tetrominoIndex).toBe(3);
        expect(mockGame.tetrominoes.getNextTetromino).toHaveBeenCalledWith(2);
    });

    test("should pass correct index to tetrominoes", () => {
        // Set initial index
        player.tetrominoIndex = 5;

        player.getNextTetromino();

        expect(mockGame.tetrominoes.getNextTetromino).toHaveBeenCalledWith(5);
        expect(player.tetrominoIndex).toBe(6);
    });

    test("should maintain reference to current game", () => {
        expect(player.currentGame).toBe(mockGame);

        // Test that game methods can be called through player
        player.completeLines(1);
        expect(mockGame.punishOthers).toHaveBeenCalledWith(player, 1);
    });
});
