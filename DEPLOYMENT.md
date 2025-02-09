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

### Option 1: PM2 Deployment (Recommended)

1. Install PM2 globally on your production server:

   ```bash
   npm install -g pm2
   ```

2. Copy the entire `dist` directory to your production server

3. Set up your `.env` file with production values

4. Install production dependencies:

   ```bash
   npm install --production
   ```

5. The PM2 ecosystem file (`ecosystem.config.js`) is included in the repository. It contains the necessary configuration for running the application with PM2.

6. Start the application with PM2:

   ```bash
   # Start the WebSocket proxy server
   pm2 start ecosystem.config.js

   # Save the process list
   pm2 save

   # Generate startup script to auto-start PM2 on server reboot
   pm2 startup
   ```

7. Useful PM2 commands:

   ```bash
   # View logs
   pm2 logs multimodal-ws-proxy

   # Monitor processes
   pm2 monit

   # Restart WebSocket proxy
   pm2 restart multimodal-ws-proxy

   # Stop WebSocket proxy
   pm2 stop multimodal-ws-proxy

   # Delete WebSocket proxy from PM2
   pm2 delete multimodal-ws-proxy
   ```

### Option 2: Manual Deployment

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

### Option 3: Docker Deployment

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

An example Nginx configuration file is provided in the repository as `nginx.conf.example`. This configuration is optimized for running the application with PM2 and includes:

- Static file serving for the React frontend
- WebSocket proxy to the PM2-managed WebSocket proxy server
- SSL configuration (commented out, but recommended for production)
- Security headers
- Gzip compression
- Logging configuration

### Setting up Nginx

1. Install Nginx if not already installed:

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nginx

   # CentOS/RHEL
   sudo yum install epel-release
   sudo yum install nginx
   ```

2. Copy and customize the Nginx configuration:

   ```bash
   # Copy the example config
   sudo cp nginx.conf.example /etc/nginx/sites-available/multimodal-api

   # Edit the configuration file
   sudo nano /etc/nginx/sites-available/multimodal-api
   ```

3. Update the following in the configuration:

   - `server_name` with your domain
   - `root` path to point to your built client files
   - SSL certificate paths (if using HTTPS)
   - Log file paths if needed

4. Enable the site and restart Nginx:

   ```bash
   # Create symlink to enable the site
   sudo ln -s /etc/nginx/sites-available/multimodal-api /etc/nginx/sites-enabled/

   # Test the configuration
   sudo nginx -t

   # Restart Nginx
   sudo systemctl restart nginx
   ```

5. Set up SSL (recommended for production):
   - Obtain SSL certificates (e.g., using Let's Encrypt)
   - Uncomment and update the SSL configuration in the Nginx config
   - Restart Nginx

## Security Considerations

1. Always use HTTPS in production
2. Store API keys securely
3. Set up proper firewalls
4. Implement rate limiting
5. Monitor server logs
6. Keep dependencies up to date

## Monitoring

### PM2 Monitoring

When using PM2, you get several monitoring features out of the box:

1. Process monitoring: `pm2 monit`
2. Log management: `pm2 logs`
3. Metrics dashboard: `pm2 plus` (requires PM2 Plus account)
4. Memory/CPU monitoring
5. Exception logging

### Additional Monitoring

Consider setting up:

1. Server monitoring (CPU, memory, disk usage)
2. Application logging (e.g., Winston, Bunyan)
3. Error tracking (e.g., Sentry)
4. Performance monitoring
5. WebSocket connection metrics
6. Custom metrics using PM2's API

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
