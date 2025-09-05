import { describe, test, expect, beforeEach } from "@jest/globals";
import Tetrominoes from "../src/Tetrominoes.js";

describe("Tetrominoes", () => {
    let tetrominoes;

    beforeEach(() => {
        tetrominoes = new Tetrominoes();
    });

    test("should create instance with initial 7 tetrominoes", () => {
        expect(tetrominoes).toBeInstanceOf(Tetrominoes);
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThanOrEqual(7);

        // Should contain all valid tetromino types
        const validKeys = ["I", "O", "T", "S", "Z", "J", "L"];
        tetrominoes.tetrominoKeys.forEach((key) => {
            expect(validKeys).toContain(key);
        });
    });

    test("should generate a new bag of 7 shuffled tetrominoes", () => {
        const bag = tetrominoes.generateNewBag();

        expect(bag).toHaveLength(7);

        // Should contain exactly one of each tetromino type
        const validKeys = ["I", "O", "T", "S", "Z", "J", "L"];
        validKeys.forEach((key) => {
            expect(bag).toContain(key);
        });

        // Should be shuffled (test randomness by generating multiple bags)
        const bags = [];
        for (let i = 0; i < 10; i++) {
            bags.push(tetrominoes.generateNewBag());
        }

        // At least one bag should be different from the first (very high probability)
        const differentBags = bags.some(bag =>
            !bag.every((key, index) => key === bags[0][index])
        );
        expect(differentBags).toBe(true);
    });

    test("should generate tetrominoes until specified index", () => {
        // Initially has 7 tetrominoes (0-6)
        expect(tetrominoes.tetrominoKeys).toHaveLength(7);

        // Generate until index 10 (needs 11 tetrominoes total)
        tetrominoes.generateTetrominoesUntil(10);
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThanOrEqual(11);

        // Should not add more if already sufficient
        const lengthBefore = tetrominoes.tetrominoKeys.length;
        tetrominoes.generateTetrominoesUntil(5);
        expect(tetrominoes.tetrominoKeys).toHaveLength(lengthBefore);
    });

    test("should get next tetromino by index", () => {
        const key0 = tetrominoes.getNextTetromino(0);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key0);

        const key5 = tetrominoes.getNextTetromino(5);
        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key5);

        // Getting same index should return same key
        expect(tetrominoes.getNextTetromino(0)).toBe(key0);
        expect(tetrominoes.getNextTetromino(5)).toBe(key5);
    });

    test("should automatically generate tetrominoes when accessing high indices", () => {
        const initialLength = tetrominoes.tetrominoKeys.length;

        // Access index beyond current length
        const key20 = tetrominoes.getNextTetromino(20);

        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key20);
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThanOrEqual(21);
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThan(initialLength);
    });

    test("should maintain tetromino sequence consistency", () => {
        // Get some tetrominoes
        const keys1 = [
            tetrominoes.getNextTetromino(0),
            tetrominoes.getNextTetromino(1),
            tetrominoes.getNextTetromino(2)
        ];

        // Access them again - should be the same
        const keys2 = [
            tetrominoes.getNextTetromino(0),
            tetrominoes.getNextTetromino(1),
            tetrominoes.getNextTetromino(2)
        ];

        expect(keys1).toEqual(keys2);
    });

    test("should generate bags in proper 7-tetromino cycles", () => {
        // Generate enough tetrominoes to span multiple bags
        tetrominoes.generateTetrominoesUntil(20);

        // Check that each complete bag of 7 contains all tetromino types
        for (let bagStart = 0; bagStart < 14; bagStart += 7) {
            const bag = tetrominoes.tetrominoKeys.slice(bagStart, bagStart + 7);
            const validKeys = ["I", "O", "T", "S", "Z", "J", "L"];

            validKeys.forEach((key) => {
                expect(bag).toContain(key);
            });
        }
    });

    test("should handle large indices efficiently", () => {
        const largeIndex = 100;
        const key = tetrominoes.getNextTetromino(largeIndex);

        expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(key);
        expect(tetrominoes.tetrominoKeys.length).toBeGreaterThanOrEqual(largeIndex + 1);
    });
});
