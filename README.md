# FinVault

FinVault is a comprehensive personal finance management application designed to empower users to take control of their financial lives. It provides a holistic view of their finances, helping them track expenses, manage budgets, set financial goals, and monitor their investment portfolio.

This repository contains the monorepo for the FinVault project, which includes:

- `apps`: The React Native (Expo) mobile application.
- `services`: The Express.js backend API.

## Features

- **Account Aggregation:** Securely link multiple bank accounts to get a consolidated view of all your transactions.
- **Budgeting:** Create and manage budgets to track your spending and stay on top of your financial goals.
- **Goal Setting:** Set and track financial goals, whether it's saving for a vacation or a down payment on a house.
- **Investment Portfolio Tracking:** Monitor the performance of your investment portfolio and track your assets.
- **Real-time Notifications:** Get real-time notifications about your account activity, upcoming bills, and budget alerts.
- **AI-powered Insights:** Leverage AI to get personalized insights into your spending habits and financial health.

## Tech Stack

### Mobile App (`apps`)

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** React Context API
- **Data Fetching:** Axios

### Backend (`services`)

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Push Notifications:** Expo Push Notification Service
- **AI:** Google Generative AI

## Prerequisites

- Node.js 18+ and npm 9+ (or use [nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL server running
- (Optional) `expo-cli` installed globally (`npm install -g expo-cli`) or use `npx expo` commands

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/finvault.git
cd finvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Make sure you have a PostgreSQL server running. Create a database and a user for the application.

### 4. Set up environment variables

The backend service requires environment variables to run. Copy the `.env.example` file in the `services` directory to a new file named `.env` and fill in the required values:

```bash
cp services/.env.example services/.env
```

You will need to provide the following:

- `DATABASE_URL`: The connection string for your PostgreSQL database.
- `JWT_SECRET`: A secret key for signing JWTs.
- `EXPO_ACCESS_TOKEN`: Your Expo access token for sending push notifications.
- `GEMINI_API_KEY`: Your API key for Google Generative AI.

### 5. Start the API server

```bash
npm run start:api
```

The API server will be running on `http://localhost:3000`.

### 6. Start the mobile app

```bash
npm run start:mobile
```

This will open the Expo dev tools in your browser. You can then run the app on a simulator or a physical device using the Expo Go app.

## Available Scripts

- `npm install`: Install all dependencies for the monorepo.
- `npm run start:api`: Start the backend API server in development mode.
- `npm run start:mobile`: Start the Expo development server for the mobile app.
- `npm run build:api`: Build the backend API for production.
- `npm run build:mobile`: Build the mobile app for production.

## Folder Structure

```
.
├── apps
│   └── mobile-app      # React Native (Expo) mobile application
├── services
│   └── api-server      # Express.js backend API
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

### Steps to contribute

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.
