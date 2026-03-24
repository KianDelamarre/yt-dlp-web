# Use a lightweight Node.js Debian image
FROM node:20-bookworm-slim

# Set environment variables for pipx
ENV PIPX_HOME=/opt/pipx \
    PIPX_BIN_DIR=/usr/local/bin

# Install system dependencies, pipx, yt-dlp, and aggressively clean all caches in a single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    pipx \
    ca-certificates \
    libatomic1 && \
    pipx install yt-dlp && \
    # Clean up APT and pip caches to reduce image footprint
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /root/.cache/pip /root/.local/state/pipx/log

WORKDIR /app

# Copy package files separately to cache node_modules resolution
COPY backend/package*.json ./backend/

# Install dependencies and aggressive cache clean
RUN cd backend && \
    npm install --omit=dev && \
    npm cache clean --force

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Ensure /tmp can be written to by yt-dlp
RUN chmod 777 /tmp

EXPOSE 3000

WORKDIR /app/backend
CMD ["npm", "start"]
