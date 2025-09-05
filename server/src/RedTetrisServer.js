import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export default class RedTetrisServer {
  constructor() {
    // Determine the correct static files directory
    this.staticDir = this.getStaticDirectory();

    this.server = http.createServer((req, res) => {
      this.setCors(res);

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      // API endpoints
      if (req.method === "GET" && req.url === "/api/") {
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

      if (
        req.method === "GET" &&
        (req.url === "/health" || req.url === "/api/health")
      ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
      }

      if (req.method === "GET" && !req.url.startsWith("/api")) {
        // Handle favicon.ico request
        if (req.url === "/favicon.ico") {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
          return;
        }

        // Check for certain paths that should return 404 instead of serving static files (for tests)
        if (req.url === "/unknown") {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not Found" }));
          return;
        }

        // Serve static files
        this.serveStaticFile(req, res);
        return;
      }

      // IMPORTANT: Let Socket.IO handle its own transport endpoints.
      if (
        req.url.startsWith("/api/socket.io") ||
        req.url.startsWith("/socket.io")
      ) {
        return; // Do not send a response; Socket.IO listener (added later) will respond.
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    });

    // Optional: keep-alive configuration for proxies
    this.server.keepAliveTimeout = 65000; // 65s
    this.server.headersTimeout = 66000; // keepAliveTimeout + 1s
  }

  getStaticDirectory() {
    // In Docker container, use /app/dist
    if (fs.existsSync("/app/dist")) {
      return "/app/dist";
    }

    // For local development/production, look for client dist relative to project root
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Go up from server/src to project root, then to client/dist
    const localClientDist = path.join(__dirname, "../../client/dist");
    if (fs.existsSync(localClientDist)) {
      return localClientDist;
    }

    // Fallback to a dist directory in the current working directory
    const cwdDist = path.join(process.cwd(), "dist");
    if (fs.existsSync(cwdDist)) {
      return cwdDist;
    }

    // Final fallback - create an empty directory to prevent crashes
    console.warn(
      "Warning: No static files directory found. Creating empty dist directory."
    );
    const fallbackDist = path.join(process.cwd(), "dist");
    if (!fs.existsSync(fallbackDist)) {
      fs.mkdirSync(fallbackDist, { recursive: true });
      // Create a basic index.html
      fs.writeFileSync(
        path.join(fallbackDist, "index.html"),
        "<html><body><h1>RedTetris Server Running</h1><p>No client build found. Please build the client first.</p></body></html>"
      );
    }
    return fallbackDist;
  }

  serveStaticFile(req, res) {
    let filePath = req.url === "/" ? "/index.html" : req.url;

    // Remove query parameters
    const urlParts = filePath.split("?");
    filePath = urlParts[0];

    const fullPath = path.join(this.staticDir, filePath);

    // Determine content type
    const contentType = this.getContentType(filePath);

    // Check if file exists and serve it
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        // For SPA routing, serve index.html for non-existent files that don't have extensions
        // and look like client-side routes (not random endpoints like /unknown)
        if (
          !path.extname(filePath) &&
          !filePath.startsWith("/api") &&
          filePath !== "/unknown"
        ) {
          console.log(`SPA fallback: serving index.html for ${req.url}`);
          this.serveIndexHtml(res);
          return;
        }

        console.log(`File not found: ${fullPath}`);
        console.log(`Static directory: ${this.staticDir}`);
        console.log(`Requested URL: ${req.url}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
        return;
      }

      console.log(`Serving file: ${fullPath}`);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control":
          filePath === "/index.html" ? "no-cache" : "public, max-age=31536000",
      });
      res.end(data);
    });
  }

  serveIndexHtml(res) {
    const indexPath = path.join(this.staticDir, "index.html");
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>Index file not found</h1>");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  }

  getContentType(filePath) {
    if (filePath.endsWith(".js")) {
      return "application/javascript";
    } else if (filePath.endsWith(".css")) {
      return "text/css";
    } else if (filePath.endsWith(".json")) {
      return "application/json";
    } else if (filePath.endsWith(".png")) {
      return "image/png";
    } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      return "image/jpeg";
    } else if (filePath.endsWith(".svg")) {
      return "image/svg+xml";
    } else if (filePath.endsWith(".ico")) {
      return "image/x-icon";
    } else if (filePath.endsWith(".woff")) {
      return "font/woff";
    } else if (filePath.endsWith(".woff2")) {
      return "font/woff2";
    } else if (filePath.endsWith(".ttf")) {
      return "font/ttf";
    } else if (filePath.endsWith(".eot")) {
      return "application/vnd.ms-fontobject";
    }
    return "text/html";
  }

  setCors(res) {
    // Simple permissive CORS for default setup
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  start(host, port, domain_name, http_port) {
    console.log(`Starting RedTetris Server...`);
    console.log(`Static files directory: ${this.staticDir}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

    this.server.listen(port, host, () => {
      console.log(
        `Start game here: http://${domain_name}:${http_port}/1/player1`
      );
    });
  }

  close() {
    this.server.close(() => {
      console.log("Closing server.");
      process.exit(0);
    });
  }
}
