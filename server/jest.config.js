export default {
    testEnvironment: "node",
    transform: {},
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    collectCoverageFrom: ["src/**/*.js", "!src/main.js"],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html", "json"],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    testPathIgnorePatterns: ["__tests__/main.test.js", "__tests__/RedTetrisServer.test.js"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testTimeout: 15000, // Increase default timeout to 15 seconds
    maxWorkers: 1, // Run tests sequentially to avoid port conflicts
    forceExit: true, // Force Jest to exit after tests complete
    detectOpenHandles: true, // Help detect what keeps Node.js process alive
};
