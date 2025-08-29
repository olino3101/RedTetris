import RedTetrisServer from "./RedTetrisServer.js";
import SocketCommunication from "./SocketCommunication.js";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;

const DOMAIN_NAME = process.env.DOMAIN_NAME || "localhost";
const HTTPS_PORT = process.env.HTTPS_PORT || "4243";

const server = new RedTetrisServer();
const socket = new SocketCommunication(server);

server.start(HOST, PORT, DOMAIN_NAME, HTTPS_PORT);

// Graceful shutdown
function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down...`);
    socket.close();
    server.close();

    // Force exit if not closed in time
    setTimeout(() => {
        console.warn("Forcing shutdown.");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
