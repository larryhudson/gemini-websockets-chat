# Production Deployment Guide

## Build Process

### 1. Build the Application
```bash
# Install dependencies
npm install

# Build both client and server
npm run build:all
```

This will create:
- `dist/client/` - Contains the built frontend application
- `dist/server/` - Contains the compiled proxy server

## Environment Setup

1. Create a production `.env` file:
```env
# Server-side API key (used by the proxy server)
GOOGLE_API_KEY=your_api_key_here
PORT=3000  # Optional, defaults to 3000
```

## Deployment Options

### Option 1: Manual Deployment

1. Copy the entire `dist` directory to your production server
2. Set up your `.env` file with production values
3. Install production dependencies:
   ```bash
   npm install --production
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

1. Create a Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy built application
COPY dist/ ./dist/

# Copy environment variables
COPY .env ./

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
```

2. Build and run the Docker container:
```bash
docker build -t multimodal-live-api .
docker run -p 3000:3000 multimodal-live-api
```

## Nginx Configuration

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your.domain.com;

    location / {
        root /path/to/dist/client;
        try_files $uri $uri/ /index.html;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Security Considerations

1. Always use HTTPS in production
2. Store API keys securely
3. Set up proper firewalls
4. Implement rate limiting
5. Monitor server logs
6. Keep dependencies up to date

## Monitoring

Consider setting up:
1. Server monitoring (CPU, memory, disk usage)
2. Application logging
3. Error tracking
4. Performance monitoring
5. WebSocket connection metrics

## Scaling

For higher traffic:
1. Use a load balancer
2. Set up multiple proxy server instances
3. Implement WebSocket sticky sessions
4. Monitor and adjust resource allocation

## Troubleshooting

Common issues and solutions:
1. WebSocket connection failures
   - Check Nginx configuration
   - Verify SSL/TLS setup
   - Check firewall rules
2. Performance issues
   - Monitor server resources
   - Check for memory leaks
   - Analyze connection patterns
