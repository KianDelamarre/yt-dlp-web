# Use a lightweight Node.js Debian image
FROM node:20-bookworm-slim

# Set environment variables for pipx and Deno
ENV PIPX_HOME=/opt/pipx \
    PIPX_BIN_DIR=/usr/local/bin \
    DENO_INSTALL=/usr/local \
    PATH="/usr/local/bin:$PATH"

# Install system dependencies, ffmpeg, curl, unzip (for installing deno), and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    curl \
    unzip \
    ca-certificates \
    libatomic1 && \
    # Install Deno globally to /usr/local/bin
    curl -fsSL https://deno.land/install.sh | sh && \
    # Download official standalone yt-dlp binary
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rxw /usr/local/bin/yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Global config only needs remote components now (deno is detected automatically)
RUN mkdir -p /etc/yt-dlp && \
    echo "--remote-components ejs:github" >> /etc/yt-dlp/config

WORKDIR /app

# Copy package files separately to cache node_modules resolution
COPY backend/package*.json ./backend/

# Install dependencies and cache clean
RUN cd backend && \
    npm install --omit=dev && \
    npm cache clean --force

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Ensure /tmp can be written to
RUN chmod 777 /tmp

EXPOSE 3000

WORKDIR /app/backend
CMD ["npm", "start"]