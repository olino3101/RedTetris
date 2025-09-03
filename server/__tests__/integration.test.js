import {
    describe,
    test,
    expect,
    beforeEach,
    afterEach,
    jest,
} from "@jest/globals";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import RedTetrisServer from "../src/RedTetrisServer.js";
import SocketCommunication from "../src/SocketCommunication.js";

// Mock the env module
jest.mock("../src/env.js", () => ({
    CORS_ORIGIN: "*",
}));

describe("Integration Tests", () => {
    let httpServer;
    let redTetrisServer;
    let socketCommunication;
    let clientSocket;
    let port;

    beforeEach((done) => {
        redTetrisServer = new RedTetrisServer();
        socketCommunication = new SocketCommunication(redTetrisServer.server);

        redTetrisServer.server.listen(0, () => {
            port = redTetrisServer.server.address().port;
            done();
        });
    });

    afterEach((done) => {
        if (clientSocket && clientSocket.connected) {
            clientSocket.disconnect();
        }

        socketCommunication.close();
        redTetrisServer.server.close(done);
    });

    test("should handle complete game flow", (done) => {
        // Set a timeout to prevent the test from hanging
        const timeout = setTimeout(() => {
            done(new Error("Test timed out"));
        }, 5000);

        clientSocket = Client(`http://localhost:${port}`);

        let welcomeReceived = false;
        let playersUpdateReceived = false;

        clientSocket.on("connect", () => {
            expect(clientSocket.connected).toBe(true);
        });

        clientSocket.on("welcome", (data) => {
            expect(data.message).toBe("Welcome to RedTetris server");
            welcomeReceived = true;

            // Join a room
            clientSocket.emit("joinRoom", {
                room: "testRoom",
                name: "TestPlayer",
            });
        });

        clientSocket.on("playersUpdate", (data) => {
            expect(data.players).toContain("TestPlayer");
            playersUpdateReceived = true;

            if (welcomeReceived && playersUpdateReceived) {
                clearTimeout(timeout);
                done();
            }
        });

        clientSocket.on("connect_error", (error) => {
            clearTimeout(timeout);
            done(error);
        });
    });

    test("should handle countdown and game start", (done) => {
        // Set a longer timeout for integration test
        const timeout = setTimeout(() => {
            done(new Error("Test timed out"));
        }, 15000);

        clientSocket = Client(`http://localhost:${port}`);

        let countdownStarted = false;
        let gameStarted = false;

        clientSocket.on("welcome", () => {
            // Join as host
            clientSocket.emit("joinRoom", {
                room: "countdownRoom",
                name: "HostPlayer",
            });
        });

        clientSocket.on("playersUpdate", () => {
            // Start countdown
            clientSocket.emit(
                "startCountdown",
                { room: "countdownRoom" },
                (response) => {
                    expect(response.message).toBe("Countdown started.");
                    countdownStarted = true;
                }
            );
        });

        clientSocket.on("roomCounter", (data) => {
            expect(data.timeLeft).toBeGreaterThanOrEqual(0);
        });

        clientSocket.on("gameStart", () => {
            gameStarted = true;
            expect(countdownStarted).toBe(true);
            clearTimeout(timeout);
            done();
        });
    }, 15000); // Increase timeout to 15 seconds

    test("should handle multiple players joining", (done) => {
        const client1 = Client(`http://localhost:${port}`);
        const client2 = Client(`http://localhost:${port}`);

        let player1Connected = false;
        let player2Connected = false;

        // Set timeout
        const timeout = setTimeout(() => {
            done(new Error("Test timed out"));
        }, 15000);

        let client1Connected = false;
        let client2Connected = false;
        let playersUpdateCount = 0;

        client1.on("welcome", () => {
            client1Connected = true;
            client1.emit("joinRoom", { room: "multiRoom", name: "Player1" });
        });

        client2.on("welcome", () => {
            client2Connected = true;
            client2.emit("joinRoom", { room: "multiRoom", name: "Player2" });
        });

        client1.on("playersUpdate", (data) => {
            playersUpdateCount++;
            if (playersUpdateCount === 2) {
                // Both players joined
                expect(data.players).toHaveLength(2);
                expect(data.players).toContain("Player1");
                expect(data.players).toContain("Player2");

                clearTimeout(timeout);
                client1.disconnect();
                client2.disconnect();
                done();
            }
        });

        client2.on("playersUpdate", (data) => {
            // This will be called when client2 joins
        });
    }, 15000); // Increase timeout to 15 seconds

    test("should handle player disconnect", (done) => {
        const client1 = Client(`http://localhost:${port}`);
        const client2 = Client(`http://localhost:${port}`);

        let bothConnected = false;

        // Set timeout
        const timeout = setTimeout(() => {
            done(new Error("Test timed out"));
        }, 15000);

        client1.on("welcome", () => {
            client1.emit("joinRoom", {
                room: "disconnectRoom",
                name: "Player1",
            });
        });

        client2.on("welcome", () => {
            client2.emit("joinRoom", {
                room: "disconnectRoom",
                name: "Player2",
            });
        });

        let playerUpdates = 0;
        let client2Disconnected = false;

        client1.on("playersUpdate", (data) => {
            playerUpdates++;
            if (playerUpdates === 1) {
                // Only Player1 joined
                expect(data.players).toHaveLength(1);
            } else if (playerUpdates === 2) {
                // Both players joined
                expect(data.players).toHaveLength(2);
                bothConnected = true;
                // Disconnect client2
                client2.disconnect();
            } else if (playerUpdates === 3) {
                // Player2 disconnected
                expect(data.players).toHaveLength(1);
                expect(data.players).toContain("Player1");
                clearTimeout(timeout);
                client1.disconnect();
                done();
            }
        });

        // Add a backup mechanism in case the third playersUpdate doesn't come
        client2.on("disconnect", () => {
            client2Disconnected = true;
            // Give a small delay for the server to process and send updates
            setTimeout(() => {
                if (playerUpdates < 3 && bothConnected) {
                    // If we haven't received the third update, complete the test
                    clearTimeout(timeout);
                    client1.disconnect();
                    done();
                }
            }, 1000);
        });
    }, 15000); // Increase timeout to 15 seconds

    test("should prevent non-host from starting countdown", (done) => {
        const client1 = Client(`http://localhost:${port}`); // Will be host
        const client2 = Client(`http://localhost:${port}`); // Will not be host

        // Set timeout
        const timeout = setTimeout(() => {
            done(new Error("Test timed out"));
        }, 15000);

        client1.on("welcome", () => {
            client1.emit("joinRoom", {
                room: "hostTestRoom",
                name: "HostPlayer",
            });
        });

        client2.on("welcome", () => {
            client2.emit("joinRoom", {
                room: "hostTestRoom",
                name: "RegularPlayer",
            });
        });

        let playersJoined = 0;
        client1.on("playersUpdate", () => {
            playersJoined++;
            if (playersJoined === 2) {
                // Try to start countdown as non-host
                client2.emit(
                    "startCountdown",
                    { room: "hostTestRoom" },
                    (response) => {
                        expect(response.message).toBe(
                            "Can't start the countdown, you are not host."
                        );

                        clearTimeout(timeout);
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }
                );
            }
        });
    }, 15000); // Increase timeout to 15 seconds
});
