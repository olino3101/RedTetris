import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import RedTetrisServer from "../src/RedTetrisServer.js";
import http from "node:http";

describe("RedTetrisServer", () => {
  let server;
  let mockRequest;
  let mockResponse;
  let originalExit;

  beforeEach(() => {
    // Mock process.exit to prevent tests from actually exiting
    originalExit = process.exit;
    process.exit = jest.fn();

    server = new RedTetrisServer();

    mockResponse = {
      writeHead: jest.fn(),
      end: jest.fn(),
      setHeader: jest.fn(),
      statusCode: null,
    };

    mockRequest = {
      method: "GET",
      url: "/",
      headers: {},
    };
  });

  afterEach(() => {
    if (server && server.server && server.server.listening) {
      server.server.close();
    }

    // Restore original process.exit
    process.exit = originalExit;
  });

  test("should create server instance", () => {
    expect(server).toBeInstanceOf(RedTetrisServer);
    expect(server.server).toBeInstanceOf(http.Server);
    expect(server.server.keepAliveTimeout).toBe(65000);
    expect(server.server.headersTimeout).toBe(66000);
  });

  test("should set CORS headers correctly", () => {
    server.setCors(mockResponse);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "*"
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET,POST,OPTIONS"
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization"
    );
  });

  test("should handle OPTIONS requests", () => {
    mockRequest.method = "OPTIONS";

    // Simulate request handling
    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.statusCode).toBe(204);
    expect(mockResponse.end).toHaveBeenCalled();
  });

  test("should handle GET / request", () => {
    mockRequest.url = "/";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    // Should not send immediate response for static file serving (async operation)
    expect(mockResponse.writeHead).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
  });

  test("should handle GET /api/ request", () => {
    mockRequest.url = "/api/";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(mockResponse.end).toHaveBeenCalledWith(
      JSON.stringify({
        name: "RedTetris server",
        version: "1.0.0",
        socket: "/socket.io",
        health: "/health",
      })
    );
  });

  test("should handle GET /health request", () => {
    mockRequest.url = "/health";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(mockResponse.end).toHaveBeenCalledWith(
      JSON.stringify({ status: "ok" })
    );
  });

  test("should ignore socket.io endpoints", () => {
    mockRequest.url = "/socket.io/";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    // Should not send any response for socket.io endpoints
    expect(mockResponse.writeHead).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
  });

  test("should handle socket.io subpaths", () => {
    mockRequest.url = "/socket.io/websocket";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.writeHead).not.toHaveBeenCalled();
    expect(mockResponse.end).not.toHaveBeenCalled();
  });

  test("should return 404 for unknown endpoints", () => {
    mockRequest.url = "/unknown";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
    expect(mockResponse.end).toHaveBeenCalledWith(
      JSON.stringify({ error: "Not Found" })
    );
  });

  test("should handle POST requests to unknown endpoints", () => {
    mockRequest.method = "POST";
    mockRequest.url = "/unknown";

    const requestHandler = server.server.listeners("request")[0];
    requestHandler(mockRequest, mockResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
    expect(mockResponse.end).toHaveBeenCalledWith(
      JSON.stringify({ error: "Not Found" })
    );
  });

  test("should start server on specified host and port", (done) => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    server.start("127.0.0.1", 0, "localhost", "4243"); // Use port 0 for random available port

    server.server.on("listening", () => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Start game here: http://localhost:4243/1/player1"
      );
      consoleSpy.mockRestore();
      done();
    });
  });

  test("should close server gracefully", (done) => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation();

    server.start("127.0.0.1", 0, "localhost", "4243");

    server.server.on("listening", () => {
      // Verify the start message
      expect(consoleSpy).toHaveBeenCalledWith(
        "Start game here: http://localhost:4243/1/player1"
      );

      // Now close the server
      server.close();

      // Give a small delay for the close callback to execute
      setTimeout(() => {
        expect(exitSpy).toHaveBeenCalledWith(0);
        consoleSpy.mockRestore();
        exitSpy.mockRestore();
        done();
      }, 100);
    });
  });
});
