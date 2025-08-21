// Basic Node.js server with Socket.IO
const http = require('http');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

function setCors(res) {
  // Simple permissive CORS for default setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        name: 'RedTetris server',
        version: '1.0.0',
        socket: '/socket.io',
        health: '/health',
      })
    );
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Optional: keep-alive configuration for proxies
server.keepAliveTimeout = 65000; // 65s
server.headersTimeout = 66000; // keepAliveTimeout + 1s

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('[socket] connected:', socket.id);

  // Basic handshake
  socket.emit('welcome', { message: 'Welcome to RedTetris server' });

  // Debug echo
  socket.on('echo', (data) => {
    socket.emit('echo', data);
  });

  socket.on('ping', (data) => {
    socket.emit('pong', data ?? { t: Date.now() });
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', socket.id, reason);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  io.close(() => {
    server.close(() => {
      console.log('Closed out remaining connections.');
      process.exit(0);
    });
  });

  // Force exit if not closed in time
  setTimeout(() => {
    console.warn('Forcing shutdown.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
