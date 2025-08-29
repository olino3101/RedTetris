import { Server } from "socket.io";
import { CORS_ORIGIN } from "./env.js";

export default class SocketCommunication {
    constructor(server) {
        this.io = new Server(server, {
            // Caddy "handle_path /api/*" strips the leading /api before proxying,
            // so backend must expose /socket.io (NOT /api/socket.io).
            path: "/socket.io",
            cors: {
                origin: CORS_ORIGIN,
                methods: ["GET", "POST"],
            },
        });

        this.io.on("connection", (socket) => {
            console.log("[socket] connected:", socket.id);

            // Basic handshake
            socket.emit("welcome", { message: "Welcome to RedTetris server" });

            // Debug echo
            socket.on("echo", (data) => {
                socket.emit("echo", data);
            });

            socket.on("ping", (data) => {
                socket.emit("pong", data ?? { t: Date.now() });
            });

            // socket.on("getNextTetrominoes", () => {});

            socket.on("disconnect", (reason) => {
                console.log("[socket] disconnected:", socket.id, reason);
            });
        });

        console.log("Created socket communication. Path: /socket.io");
    }

    close() {
        this.io.close(() => {
            console.log("Closing sockets.");
        });
    }
}
