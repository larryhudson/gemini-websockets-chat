# Multimodal Live API - Web Console

This repository contains a modern React-based application for using the [Multimodal Live API](https://ai.google.dev/api/multimodal-live) over a websocket. It provides modules for streaming audio playback, recording user media such as from a microphone, webcam or screen capture as well as a unified log view to aid in development of your application.

## Features

- Built with Vite for lightning-fast development and optimal production builds
- React Router for seamless client-side navigation
- Modern UI with Tailwind CSS
- Secure websocket proxy to protect your API key in production
- Modules for streaming audio playback and media recording
- Unified log view for development

See the [feature-plan.md](feature-plan.md) file for a detailed description of the implementation plan.

## Getting Started

1. [Create a free Gemini API key](https://aistudio.google.com/apikey)
2. Clone this repository
3. Create a `.env` file in the root directory and add your API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## Development

### Project Structure

The project consists of:

- A Vite-powered React application with TypeScript support
- Websocket proxy server for secure API key handling
- Event-emitting websocket client for frontend-backend communication
- Communication layer for processing audio in and out
- Modern UI components styled with Tailwind CSS

### Available Scripts

```bash
# Start Vite development server
npm run dev

# Start websocket proxy server
npm run server

# Start both development server and proxy
npm run dev:all

# Build client for production
npm run build

# Build server for production
npm run build:server

# Build both client and server
npm run build:all

# Start production server
npm run start

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck

# Run all checks
npm run check
```

### Deployment

See the [DEPLOYMENT.md](DEPLOYMENT.md) file for instructions on how to deploy the application.
