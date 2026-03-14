# ShelbyShare

Decentralized file sharing powered by [Shelby Protocol](https://shelby.xyz). Upload files, get a shareable link, and let anyone download.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Shelby Protocol SDK** (`@shelby-protocol/sdk`, `@shelby-protocol/react`)
- **Aptos wallet adapter** (`@aptos-labs/wallet-adapter-react`)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SHELBY_API_KEY` – from [Shelby Discord](https://discord.gg/shelbyprotocol) (testnet)
   - `NEXT_PUBLIC_APTOS_API_KEY` – from [Aptos developers](https://aptos.dev) (optional, for rate limits)

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Upload** – Connect an Aptos wallet (e.g. Petra), upload a file; the app encodes it, registers on-chain, and uploads to Shelby storage.
- **Share link** – Each file gets a single share ID; the link is `/file/[id]`. Copy and share.
- **Download** – Open the link to see file info and download (or preview images/PDF/text).
- **Dashboard** – `/dashboard` lists files uploaded by the connected wallet.

## Requirements

- **ShelbyUSD** (1 per upload) – testnet tokens via Shelby Discord.
- **APT** – testnet APT for gas from [Aptos Faucet](https://aptos.dev/network/faucet).

## Project structure

```
/app              – App Router pages (/, /dashboard, /file/[id])
/components       – UploadBox, FileCard, WalletConnect, ShareLink, Header, Providers
/lib/shelby.ts    – Shelby client helpers: encodeFile, createRegisterBlobPayload,
                    uploadBlobData, downloadFile, shareId encode/decode
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Production build
- `npm run start` – Run production server
- `npm run lint` – Run ESLint
