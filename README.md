# Discord Lavalink Music Bot

Music bot Discord menggunakan:

- Discord.js v14
- Shoukaku v4
- Lavalink v4
- Plugin YouTube resmi Lavalink
- Docker Compose

Lavalink berjalan sebagai server audio terpisah. Bot hanya mengatur command dan antrean, sehingga proses audio lebih stabil daripada memproses FFmpeg langsung di proses Node.js.

## Fitur

- `/play` dari judul atau URL YouTube/SoundCloud
- Playlist URL
- Pause, resume, skip, stop
- Queue, now playing
- Shuffle, loop, volume
- Remove, clear, leave
- Queue terpisah per server
- Lavalink dan bot dijalankan melalui Docker

## 1. Persiapan

Pastikan Docker Desktop aktif:

```bash
docker --version
docker compose version
```

## 2. Konfigurasi

Salin `.env.example` menjadi `.env`.

Git Bash:

```bash
cp .env.example .env
```

Isi:

```env
DISCORD_TOKEN=token_bot
CLIENT_ID=application_id
GUILD_ID=id_server_discord

LAVALINK_PASSWORD=youshallnotpass
```

Ganti password Lavalink untuk deployment publik.

## 3. Install dependency untuk deploy command

```bash
npm install
```

## 4. Daftarkan slash command

```bash
npm run deploy
```

## 5. Jalankan seluruh service

```bash
docker compose up -d --build
```

Lihat log:

```bash
docker compose logs -f
```

Atau hanya log bot:

```bash
docker compose logs -f bot
```

Log Lavalink:

```bash
docker compose logs -f lavalink
```

## 6. Penggunaan

Masuk ke voice channel, lalu:

```text
/play query:John Newman Love Me Again
```

atau URL:

```text
/play query:https://www.youtube.com/watch?v=...
```

## Menjalankan bot lokal dan Lavalink di Docker

Jalankan Lavalink saja:

```bash
docker compose up -d lavalink
```

Ubah `.env`:

```env
LAVALINK_HOST=localhost
```

Lalu:

```bash
npm run dev
```

## Menghentikan

```bash
docker compose down
```

Untuk sekaligus menghapus volume plugin dan log:

```bash
docker compose down -v
```

## Jika audio masih putus-putus

Naikkan nilai berikut pada `lavalink/application.yml`:

```yaml
bufferDurationMs: 2000
frameBufferDurationMs: 15000
```

Kemudian restart:

```bash
docker compose restart lavalink
```

Pastikan Docker Desktop mendapat RAM minimal 1 GB untuk bot dan Lavalink. Konfigurasi bawaan membatasi Java pada 512 MB.
