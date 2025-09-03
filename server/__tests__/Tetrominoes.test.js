import { describe, test, expect, beforeEach } from "@jest/globals";
import Tetrominoes from "../src/Tetrominoes.js";

describe("Tetrominoes", () => {
    let tetrominoes;

    beforeEach(() => {
        tetrominoes = new Tetrominoes();
    });

    test("should create instance with initial random key", () => {
        expect(tetrominoes).toBeInstanceOf(Tetrominoes);
        expect(tetrominoes.tetrominoKeys).toHaveLength(1);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(
            tetrominoes.tetrominoKeys[0]
        );
    });

    test("should generate random keys from valid piece set", () => {
        const validKeys = ["I", "O", "T", "S", "Z", "J", "L"];

        for (let i = 0; i < 100; i++) {
            const key = tetrominoes.randomKey();
            expect(validKeys).toContain(key);
        }
    });

    test("should add random keys to sequence", () => {
        const initialLength = tetrominoes.tetrominoKeys.length;
        tetrominoes.addRandomKey();

        expect(tetrominoes.tetrominoKeys).toHaveLength(initialLength + 1);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(
            tetrominoes.tetrominoKeys[tetrominoes.tetrominoKeys.length - 1]
        );
    });

    test("should ensure index exists by generating keys", () => {
        expect(tetrominoes.tetrominoKeys).toHaveLength(1);

        tetrominoes.ensureIndex(5);
        expect(tetrominoes.tetrominoKeys).toHaveLength(6);

        // Should not add more if already exists
        tetrominoes.ensureIndex(3);
        expect(tetrominoes.tetrominoKeys).toHaveLength(6);
    });

    test("should get next tetromino by index", () => {
        const key0 = tetrominoes.getNextTetromino(0);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key0);

        const key5 = tetrominoes.getNextTetromino(5);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key5);
        expect(tetrominoes.tetrominoKeys).toHaveLength(6);

        // Getting same index should return same key
        expect(tetrominoes.getNextTetromino(0)).toBe(key0);
        expect(tetrominoes.getNextTetromino(5)).toBe(key5);
    });

    test("should get next batch of tetrominoes", () => {
        const batch = tetrominoes.getNextBatch(0, 5);

        expect(batch).toHaveLength(5);
        batch.forEach((key) => {
            expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key);
        });

        // Should generate enough keys
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThanOrEqual(5);
    });

    test("should get batch starting from specific index", () => {
        const batch1 = tetrominoes.getNextBatch(3, 3);
        const batch2 = tetrominoes.getNextBatch(3, 3);

        expect(batch1).toEqual(batch2); // Same batch should be identical
        expect(batch1).toHaveLength(3);

        // Verify keys are from correct indices
        expect(batch1[0]).toBe(tetrominoes.getNextTetromino(3));
        expect(batch1[1]).toBe(tetrominoes.getNextTetromino(4));
        expect(batch1[2]).toBe(tetrominoes.getNextTetromino(5));
    });

    test("should handle large indices efficiently", () => {
        const largeIndex = 1000;
        const key = tetrominoes.getNextTetromino(largeIndex);

        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key);
        expect(tetrominoes.tetrominoKeys).toHaveLength(largeIndex + 1);
    });
});
