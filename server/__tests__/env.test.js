import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";

describe("env.js", () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // Reset modules to ensure fresh imports
        jest.resetModules();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    test("should use wildcard when CORS_ORIGIN is not set", async () => {
        delete process.env.CORS_ORIGIN;

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toBe("*");
    });

    test("should parse single CORS origin", async () => {
        process.env.CORS_ORIGIN = "https://example.com";

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toEqual(["https://example.com"]);
    });

    test("should parse multiple CORS origins", async () => {
        process.env.CORS_ORIGIN =
            "https://example.com,https://localhost:3000,https://app.domain.com";

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toEqual([
            "https://example.com",
            "https://localhost:3000",
            "https://app.domain.com",
        ]);
    });

    test("should trim whitespace from CORS origins", async () => {
        process.env.CORS_ORIGIN =
            " https://example.com , https://localhost:3000 , https://app.domain.com ";

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toEqual([
            "https://example.com",
            "https://localhost:3000",
            "https://app.domain.com",
        ]);
    });

    test("should handle empty string CORS_ORIGIN", async () => {
        process.env.CORS_ORIGIN = "";

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toEqual([""]);
    });

    test("should handle CORS_ORIGIN with only commas", async () => {
        process.env.CORS_ORIGIN = ",,";

        const { CORS_ORIGIN } = await import("../src/env.js");

        expect(CORS_ORIGIN).toEqual(["", "", ""]);
    });
});
