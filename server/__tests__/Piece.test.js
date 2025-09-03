import { describe, test, expect } from "@jest/globals";
import Piece from "../src/Piece.js";

describe("Piece", () => {
    test("should create a Piece instance", () => {
        const piece = new Piece();
        expect(piece).toBeInstanceOf(Piece);
    });

    test("should be a class", () => {
        expect(typeof Piece).toBe("function");
        expect(Piece.prototype).toBeDefined();
    });
});
