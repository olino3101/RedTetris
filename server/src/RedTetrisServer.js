import * as http from "node:http";

export default class RedTetrisServer {
    constructor() {
        this.server = http.createServer((req, res) => {
            this.setCors(res);

            if (req.method === "OPTIONS") {
                res.statusCode = 204;
                res.end();
                return;
            }

            if (
                req.method === "GET" &&
                (req.url === "/" || req.url === "/api/")
            ) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        name: "RedTetris server",
                        version: "1.0.0",
                        socket: "/socket.io",
                        health: "/health",
                    })
                );
                return;
            }

            if (req.method === "GET" && req.url === "/health") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok" }));
                return;
            }

            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not Found" }));
        });

        // Optional: keep-alive configuration for proxies
        this.server.keepAliveTimeout = 65000; // 65s
        this.server.headersTimeout = 66000; // keepAliveTimeout + 1s
    }

    setCors(res) {
        // Simple permissive CORS for default setup
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type,Authorization"
        );
    }

    start(host, port, domain_name, https_port) {
        this.server.listen(port, host, () => {
            console.log(`Web page on https://${domain_name}:${https_port}`);
        });
    }

    close() {
        this.server.close(() => {
            console.log("Closing server.");
            process.exit(0);
        });
    }
}
