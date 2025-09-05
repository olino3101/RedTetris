import {
    describe,
    test,
    expect,
    beforeEach,
    afterEach,
    jest,
} from "@jest/globals";

describe("main.js", () => {
    let originalEnv;
    let mockServer;
    let mockSocket;
    let MockRedTetrisServer;
    let MockSocketCommunication;

    beforeEach(async () => {
        // Save original environment
        originalEnv = { ...process.env };

        // Mock process.exit to prevent test termination
        jest.spyOn(process, 'exit').mockImplementation(() => {});

        // Reset modules
        jest.resetModules();

        // Create mocks
        mockServer = {
            server: { 
                close: jest.fn((callback) => {
                    if (callback) callback();
                })
            },
            start: jest.fn(),
            close: jest.fn((callback) => {
                if (callback) callback();
            }),
        };

        mockSocket = {
            close: jest.fn(),
        };

        // Mock the modules with jest.unstable_mockModule for ES modules
        jest.unstable_mockModule("../src/RedTetrisServer.js", () => ({
            default: jest.fn(() => mockServer)
        }));

        jest.unstable_mockModule("../src/SocketCommunication.js", () => ({
            default: jest.fn(() => mockSocket)
        }));

        // Import the mocked constructors
        const RedTetrisServerModule = await import("../src/RedTetrisServer.js");
        const SocketCommunicationModule = await import("../src/SocketCommunication.js");
        
        MockRedTetrisServer = RedTetrisServerModule.default;
        MockSocketCommunication = SocketCommunicationModule.default;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        jest.restoreAllMocks();
        jest.resetModules();
    });

    test("should use default environment variables", async () => {
        // Clear environment variables
        delete process.env.HOST;
        delete process.env.PORT;
        delete process.env.DOMAIN_NAME;
        delete process.env.HTTPS_PORT;

        await import("../src/main.js");

        expect(MockRedTetrisServer).toHaveBeenCalledTimes(1);
        expect(MockSocketCommunication).toHaveBeenCalledWith(mockServer.server);
        expect(mockServer.start).toHaveBeenCalledWith(
            "0.0.0.0",
            3000,
            "localhost",
            "4243"
        );
    });

    test("should use custom environment variables", async () => {
        process.env.HOST = "127.0.0.1";
        process.env.PORT = "8080";
        process.env.DOMAIN_NAME = "example.com";
        process.env.HTTPS_PORT = "8443";

        await import("../src/main.js");

        expect(mockServer.start).toHaveBeenCalledWith(
            "127.0.0.1",
            8080,
            "example.com",
            "8443"
        );
    });

    test("should handle string PORT conversion", async () => {
        process.env.PORT = "9000";

        await import("../src/main.js");

        expect(mockServer.start).toHaveBeenCalledWith(
            "0.0.0.0",
            9000,
            "localhost",
            "4243"
        );
    });

    test("should handle invalid PORT gracefully", async () => {
        process.env.PORT = "invalid";

        await import("../src/main.js");

        // Should fall back to default port 3000 when PORT is NaN
        expect(mockServer.start).toHaveBeenCalledWith(
            "0.0.0.0",
            3000,
            "localhost",
            "4243"
        );
    });

    test("should register SIGINT handler", async () => {
        const processOnSpy = jest.spyOn(process, "on");
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        const setTimeoutSpy = jest
            .spyOn(global, "setTimeout")
            .mockImplementation();

        await import("../src/main.js");

        expect(processOnSpy).toHaveBeenCalledWith(
            "SIGINT",
            expect.any(Function)
        );

        // Get the SIGINT handler
        const sigintCall = processOnSpy.mock.calls.find(
            (call) => call[0] === "SIGINT"
        );
        const sigintHandler = sigintCall[1];

        // Call the handler
        sigintHandler();

        expect(consoleSpy).toHaveBeenCalledWith(
            "Received SIGINT. Shutting down..."
        );
        expect(mockSocket.close).toHaveBeenCalled();
        expect(mockServer.close).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

        consoleSpy.mockRestore();
        setTimeoutSpy.mockRestore();
    });

    test("should register SIGTERM handler", async () => {
        const processOnSpy = jest.spyOn(process, "on");
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        await import("../src/main.js");

        expect(processOnSpy).toHaveBeenCalledWith(
            "SIGTERM",
            expect.any(Function)
        );

        // Get the SIGTERM handler
        const sigtermCall = processOnSpy.mock.calls.find(
            (call) => call[0] === "SIGTERM"
        );
        const sigtermHandler = sigtermCall[1];

        // Call the handler
        sigtermHandler();

        expect(consoleSpy).toHaveBeenCalledWith(
            "Received SIGTERM. Shutting down..."
        );
        expect(mockSocket.close).toHaveBeenCalled();
        expect(mockServer.close).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test("should force exit after timeout", async () => {
        const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
        const processExitSpy = jest.spyOn(process, "exit").mockImplementation();

        let timeoutCallback;
        const setTimeoutSpy = jest
            .spyOn(global, "setTimeout")
            .mockImplementation((callback, delay) => {
                timeoutCallback = callback;
                return { unref: jest.fn() };
            });

        await import("../src/main.js");

        const processOnSpy = jest.spyOn(process, "on");
        const sigintCall = processOnSpy.mock.calls.find(
            (call) => call[0] === "SIGINT"
        );
        const sigintHandler = sigintCall[1];

        // Trigger shutdown
        sigintHandler();

        // Execute the timeout callback
        timeoutCallback();

        expect(consoleSpy).toHaveBeenCalledWith("Forcing shutdown.");
        expect(processExitSpy).toHaveBeenCalledWith(1);

        consoleSpy.mockRestore();
        processExitSpy.mockRestore();
        setTimeoutSpy.mockRestore();
    });

    test("should create server and socket communication instances", async () => {
        await import("../src/main.js");

        expect(MockRedTetrisServer).toHaveBeenCalledTimes(1);
        expect(MockSocketCommunication).toHaveBeenCalledTimes(1);
        expect(MockSocketCommunication).toHaveBeenCalledWith(mockServer.server);
    });
});
