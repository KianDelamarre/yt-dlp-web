<h1 align="center">yt-dlp-web</h1>

<p align="center">
  <img width="200" height="200" src="https://github.com/KianDelamarre/yt-dlp-web/blob/main/frontend/icons/icon-512.png" />
</p>

##


A sleek, self-hosted web interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp). Effortlessly download videos and audio from YouTube, TikTok, and hundreds of other platforms directly to your server.

[![Docker Image Size](https://img.shields.io/docker/image-size/kiansd/yt-dlp-web/latest)](https://hub.docker.com/r/kiansd/yt-dlp-web)
[![Docker Pulls](https://img.shields.io/docker/pulls/kiansd/yt-dlp-web)](https://hub.docker.com/r/kiansd/yt-dlp-web)


## ✨ Features

- **🚀 Simple & Fast**: Paste a URL and download in seconds.
- **🎥 iOS Compatible MP4**: Video downloads optimised for IOS to save directly to photos.
- **🎵 High-Quality Audio**: Extract audio as high-quality MP3 files.
- **📱 TikTok Ready**: Works seamlessly with TikTok, YouTube, and many more.
- **🐳 Dockerized**: Easy deployment with Docker and Docker Compose.
- **🎨 Modern UI**: A clean, responsive interface that works on desktop and mobile.
- **🛠️ Self-Hosted**: Keep your downloads private and accessible on your local network.

## 🚀 Quick Start (Docker Compose)

The easiest way to get started is using Docker Compose. Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  yt-dlp-web:
    image: kiansd/yt-dlp-web:latest
    container_name: yt-dlp-web
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - ALLOWED_ORIGIN=http://your-ip-or-domain # Optional: Set your frontend origin for CORS
    volumes:
      - ./downloads:/tmp # Local folder to store temporary download files
```

### 🛠️ Installation Steps

1. Create a directory for the project:
   ```bash
   mkdir yt-dlp-web && cd yt-dlp-web
   ```
2. Create the `docker-compose.yml` (as shown above).
3. Start the container:
   ```bash
   docker compose up -d
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## ⚙️ Configuration

| Environment Variable | Default | Description |
|----------------------|---------|-------------|
| `ALLOWED_ORIGIN`     | `*`     | The origin allowed to make CORS requests. Set this to your server's IP or domain for better security. |

## 🏗️ Local Development

If you want to run the project locally without Docker:

### Prerequisites

- Node.js (v20 or higher)
- ffmpeg (installed and in your system PATH)
- yt-dlp (installed and in your system PATH)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KianDelamarre/yt-dlp-web.git
   cd yt-dlp-web
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Run the Backend**:
   ```bash
   npm start
   ```

4. **Access the Frontend**:
   The backend serves the frontend automatically at `http://localhost:3000`.

## 🤝 Contributing

- Contributions are welcome! Feel free to open an issue or submit a pull request.
- Open an issue for bugs or feature requests.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for the full license text.

---

Built with ❤️ using [yt-dlp](https://github.com/yt-dlp/yt-dlp).
