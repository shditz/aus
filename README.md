# AUS - Automated Upload System

Aplikasi web untuk mengotomatiskan workflow distribusi musik. Sistem ini menghubungkan Suno (AI music generator) dengan DistroKid untuk mengunduh, memproses, dan mendistribusikan musik ke berbagai platform streaming secara otomatis menggunakan browser automation.

## Fitur

- Visual workflow editor untuk mengelola automation steps
- Browser automation dengan Playwright untuk interaksi web
- Automated form filling dan submission ke DistroKid
- Real-time status tracking untuk setiap step automation
- Session management untuk login persistence
- Support multiple languages dan genres melalui DistroKid API
- Dark/Light theme support

## Requirements

- Node.js 18+
- npm atau pnpm
- Browsers (Playwright akan mendownload secara otomatis)

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd aus
```

### Install Dependencies

Menggunakan npm:

```bash
npm install
```

Atau menggunakan pnpm:

```bash
pnpm install
```

## Development

### Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Build Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Project Structure

```
app/                    # Next.js app directory
  ├── page.tsx          # Main dashboard page
  ├── layout.tsx        # Root layout
  ├── globals.css       # Global styles
  └── api/              # API routes
      ├── run-bot/      # Trigger automation endpoint
      ├── save-session/ # Save browser session
      └── status/       # Get automation status

components/            # React components
  ├── ControlPanel.tsx          # Control panel UI
  └── workflow/
      ├── FlowEditor.tsx        # Visual workflow editor
      └── WorkflowNode.tsx      # Individual workflow nodes

lib/                   # Core logic
  ├── types.ts          # TypeScript type definitions
  ├── constants.ts      # Constants dan language/genre data
  ├── playwright/       # Browser automation
  │   ├── main.ts       # Main automation orchestration
  │   ├── browser.ts    # Browser session management
  │   ├── suno.ts       # Suno API interactions
  │   └── uploader.ts   # DistroKid upload automation
  └── utils/
      ├── errors.ts     # Error handling
      ├── logger.ts     # Logging utilities
      └── retry.ts      # Retry logic

public/               # Static assets
storage/              # Runtime data
  ├── downloads/      # Downloaded music files
  └── session/        # Browser session data

```

## Automation Workflow

Sistem automation mengikuti tahapan berikut:

1. **Trigger** - Inisiasi automation process
2. **Launch** - Launch browser dan buka halaman Suno
3. **Session** - Load atau create browser session
4. **Config** - Configure upload settings
5. **Navigate** - Navigate ke halaman musik Suno
6. **Verify** - Verify music details
7. **Authentication** - Handle Suno login
8. **Download** - Download audio dan artwork
9. **DistroKid Upload** - Navigate dan login ke DistroKid
10. **Form Filling** - Isi metadata dan distribution form
11. **Submit** - Submit untuk distribution ke streaming platforms
12. **Complete** - Finalize dan save session

## API Endpoints

### POST /api/run-bot

Memicu automation dengan konfigurasi yang ditentukan.

Request body:

```json
{
  "action": "upload",
  "title": "Song Title",
  "cover": "image_url",
  "songUrl": "suno_url",
  "releaseDate": "2026-05-07",
  "language": "10",
  "primaryGenre": "58",
  "secondaryGenre": "123",
  "performerName": "Artist Name",
  "producerName": "Producer Name",
  "songwriterFirstName": "Writer",
  "songwriterLastName": "Name",
  "deleteFiles": true
}
```

### GET /api/status

Dapatkan status automation yang sedang berjalan.

### POST /api/save-session

Simpan browser session untuk reuse.

## Environment Variables

Buat file `.env` di root directory project:

```bash
cp .env.example .env
```

Atau buat file `.env` secara manual dengan konfigurasi yang diperlukan. Lihat file `.env.example` untuk referensi.

## Technologies

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Browser Automation**: Playwright
- **Workflow Visualization**: React Flow (@xyflow/react)
- **Icons**: Lucide React
- **Audio Processing**: Sharp, node-id3

## Development Tips

1. Gunakan dev server untuk development
2. Hot reload otomatis tersedia
3. Playwright akan mendownload browsers pada first run
4. Sessions disimpan di `storage/session/` untuk debugging
5. Downloads tersimpan di `storage/downloads/`

## Troubleshooting

### Playwright Browser Issues

```bash
npx playwright install
```

### Clear Sessions

Hapus folder `storage/session/` untuk reset semua sessions.

### Check Logs

Logs automation tersimpan dan ditampilkan di dashboard UI.

## License

Private project

## Support

Untuk issues atau questions, silakan buat issue di repository.
