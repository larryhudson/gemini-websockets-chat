module.exports = {
  apps: [{
    name: 'multimodal-ws-proxy',
    script: './dist/server/index.js', // WebSocket proxy server
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      // Environment variables will be loaded from .env file
    }
  }]
}
