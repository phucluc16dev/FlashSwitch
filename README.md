# FlashSwitch

**Professional multi-account manager for Google Gemini and Claude AI.**

FlashSwitch is a desktop application built with Electron that helps power users manage multiple AI accounts efficiently. It automates account switching, monitors API quota in real-time, and provides a built-in proxy server compatible with OpenAI and Anthropic APIs.

---

## Table of Contents

- [Why FlashSwitch](#why-flashswitch)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Why FlashSwitch

When working with AI coding assistants, you may run into these common problems:

- A single account's quota runs out quickly, forcing manual switching.
- Managing multiple Google or Claude accounts is tedious and error-prone.
- There is no easy way to see how much quota remains on each account.
- You need a local API proxy that works seamlessly with existing development tools.

FlashSwitch was built to solve all of these. It acts as a centralized hub for your AI accounts, automating the tedious parts so you can focus on what matters — building.

---

## Features

### Cloud Account Pool
- Add unlimited Google Gemini and Claude accounts via OAuth.
- View avatar, email, status, and last used time for each account.
- Real-time status monitoring: Active, Rate Limited, or Expired.

### Real-time Quota Monitoring
- Supports multiple models: gemini-pro, claude-3-5-sonnet, and more.
- Visual progress bars with color-coded indicators (green, yellow, red).
- Automatic and manual refresh options.

### Intelligent Auto-Switching
- Unlimited pool mode with smart backup account selection.
- Automatically switches to the next available account when quota drops below 5% or when rate-limited.
- Background monitoring runs every 5 minutes.

### Local API Proxy
- OpenAI and Anthropic API compatible endpoints.
- Configurable port, request timeout, and upstream proxy.
- Model mapping support (e.g., route Claude requests to Gemini).

### Google Pro Upgrade System
- Request-based upgrade flow with three plans: Pro, Pro+, and Pro Vip.
- Collects user contact information (Zalo or Telegram) for manual processing.
- Sends detailed notifications to the admin via Telegram bot.

### Security
- AES-256-GCM encryption for all sensitive data.
- OS native credential manager integration (Keytar).
- Automatic migration of legacy plaintext data to encrypted storage.

### Additional Capabilities
- System tray support for background operation.
- IDE sync: automatically scan and import accounts from IDE databases.
- Batch operations for refreshing or deleting multiple accounts.
- Internationalization: English and Vietnamese.
- Modern UI built with React, TailwindCSS, and Shadcn UI.

---

## Screenshots

Screenshots will be added in a future update.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/phucluc16dev/FlashSwitch.git
cd FlashSwitch

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env

# Start the application in development mode
npm start
```

### Build for Production

```bash
npm run make
```

This will generate platform-specific installers in the `out/` directory.

---

## Tech Stack

| Category       | Technologies                                                     |
|----------------|------------------------------------------------------------------|
| Core           | Electron, React, TypeScript                                      |
| Build Tool     | Vite, Electron Forge                                             |
| Backend        | NestJS (embedded), Fastify                                       |
| Styling        | TailwindCSS, Shadcn UI                                           |
| State          | TanStack Query, TanStack Router                                  |
| Database       | Better-SQLite3 (local), Supabase (cloud)                         |
| Testing        | Vitest, Playwright                                               |
| Security       | AES-256-GCM, Keytar                                              |

---

## Project Structure

```
FlashSwitch/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts            # Preload script (context bridge)
│   ├── components/           # React UI components
│   ├── routes/               # Application pages and routing
│   ├── ipc/                  # IPC communication handlers
│   ├── server/               # Embedded NestJS server
│   │   ├── main.ts           # Server bootstrap
│   │   └── modules/
│   │       ├── proxy/        # API proxy module
│   │       └── payment/      # Google Pro upgrade module
│   ├── services/             # Background services
│   ├── constants/            # Application constants
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Shared utilities
├── scripts/                  # Build and utility scripts
├── docs/                     # Documentation and assets
├── .github/                  # GitHub Actions workflows
├── .env.example              # Environment variable template
├── package.json
├── forge.config.ts           # Electron Forge configuration
├── tsconfig.json
└── vite.*.config.mts         # Vite configuration files
```

---

## Available Scripts

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `npm start`          | Start the app in development mode          |
| `npm run make`       | Build production packages for your platform|
| `npm run lint`       | Run ESLint                                 |
| `npm run format:write` | Format code with Prettier                |
| `npm run test`       | Run unit tests with Vitest                 |
| `npm run test:e2e`   | Run end-to-end tests with Playwright       |
| `npm run test:all`   | Run all tests (unit + E2E)                 |
| `npm run type-check` | Run TypeScript type checking               |

---

## Configuration

Create a `.env` file in the project root (use `.env.example` as a template):

| Variable              | Description                              | Required |
|-----------------------|------------------------------------------|----------|
| `TELEGRAM_BOT_TOKEN`  | Telegram bot token for admin notifications | Yes    |
| `TELEGRAM_CHAT_ID`    | Telegram chat ID to receive notifications  | Yes    |
| `SUPABASE_URL`        | Supabase project URL                       | Optional |
| `SUPABASE_ANON_KEY`   | Supabase anonymous key                     | Optional |

---

## FAQ

**Q: The app won't start?**

Check the following:
1. Make sure all dependencies are installed: `npm install`
2. Verify your Node.js version is 18 or higher: `node -v`
3. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

**Q: Account login failed?**

1. Ensure your network connection is working.
2. Try clearing the app data and logging in again.
3. Check if the account has been restricted by Google or Anthropic.

**Q: Port 8045 is already in use?**

FlashSwitch automatically handles this on startup. If the issue persists, manually kill the process:
```bash
# Windows (PowerShell)
netstat -ano | findstr :8045
taskkill /PID <PID> /F
```

**Q: Telegram notifications are not working?**

1. Verify that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correctly set in your `.env` file.
2. Restart the application after updating `.env`.
3. Run `node scripts/test-telegram.js` to test connectivity.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md) Code of Conduct.

---

## License

[CC BY-NC-SA 4.0](LICENSE)

---

## Disclaimer

This project is intended solely for educational and research purposes. It is provided "as-is" without any warranty. Commercial use is strictly prohibited.

By using this software, you agree that you will not use it for any commercial purposes. You are solely responsible for ensuring your use complies with all applicable laws and regulations. The authors and contributors are not responsible for any misuse or damages arising from the use of this software.

---

If this project is useful to you, consider giving it a star on GitHub.
