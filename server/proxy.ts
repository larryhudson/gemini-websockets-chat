import { config } from 'dotenv';
import httpProxy from 'http-proxy';
import http from 'http';

// Load environment variables
config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY not found in environment variables');
  process.exit(1);
}

const targetUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GOOGLE_API_KEY}`;

// Create a proxy instance
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
});

// Create an HTTP server
const server = http.createServer((req, res) => {
  console.log('HTTP Request:', {
    url: req.url,
    method: req.method,
    headers: req.headers,
  });
  res.writeHead(404);
  res.end('Not found');
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  console.log('Upgrade Request:', {
    url: req.url,
    headers: req.headers,
    target: targetUrl,
  });

  if (req.url === '/ws') {
    proxy.ws(req, socket, head, {
      target: targetUrl,
      ignorePath: true, // Prevent appending the source path
    });
  } else {
    console.log('Non-ws upgrade request, destroying socket');
    socket.destroy();
  }
});

// Log before proxy request is made
proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
  console.log('Before Proxy Request:', {
    proxyReqUrl: proxyReq.path,
    proxyReqHeaders: proxyReq.getHeaders(),
    originalUrl: req.url,
    originalHeaders: req.headers,
    targetOptions: options,
  });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', {
    error: err.message,
    stack: err.stack,
    reqUrl: req.url,
    reqHeaders: req.headers,
  });
  if (res.writeHead) {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Proxy error');
  }
});

// Log successful proxy requests
proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log('Proxy Response:', {
    statusCode: proxyRes.statusCode,
    headers: proxyRes.headers,
    originalUrl: req.url,
  });
});

// Log when WebSocket connections are closed
proxy.on('close', (req, socket, head) => {
  console.log('WebSocket Connection Closed:', {
    reqUrl: req?.url,
    socketConnected: socket?.connected,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);

console.log(`Proxy server running on port ${PORT}`);
