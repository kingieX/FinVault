# FinVault

This repository is for the FinVault monorepo:

- `apps` — Expo (React Native / TypeScript) mobile app
- `services` — Express (TypeScript) API server

## Prerequisites

- Node.js 18+ and npm 9+ (or use nvm)
- (Optional) `expo-cli` installed globally (`npm install -g expo-cli`) or use `npx expo` commands

## Quick start

1. Install dependencies:

   ```bash
   cd finvault
   npm install
   ```

2. Start the API server (dev):

   ```bash
   npm run start:api
   # runs services in dev mode (ts-node-dev)
   ```

3. Start the mobile app:
   ```bash
   npm run start:mobile
   # opens Expo dev tools; then run on simulator/device
   ```
