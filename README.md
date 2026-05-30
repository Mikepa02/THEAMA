# THEAMA

## Project Overview
THEAMA is a theatre booking and management platform consisting of:

- Mobile application (TheamaMobile)
- Backend API (Node.js)
- MariaDB database

## Technologies Used
- Node.js
- Express.js
- MariaDB
- React Native / Expo
- JavaScript

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mikepa02/THEAMA.git
cd THEAMA
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd theama-backend
```

Install dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file to create your `.env` file:

```bash
cp .env.example .env
```

Edit the `.env` file and update the database credentials if needed:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mariadb_password
DB_NAME=theama
PORT=3000
```

### 4. Database Setup

#### Automated Setup (Recommended)

Run this command to automatically create the database and load all data:

```bash
npm run setup
```

This single command will:
1. Create the MariaDB database (if it doesn't exist)
2. Create all tables using the schema
3. Populate the database with initial data

**That's all the teacher needs to run!** No other steps needed for the database.

#### Manual Setup (Alternative)

If the automated setup doesn't work, you can set up manually:

1. First, make sure MariaDB is running
2. Open a terminal in the `theama-backend` directory
3. Run these commands one by one:

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql
```

When prompted, enter your MariaDB root password.

### 5. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run at `http://localhost:3000`

### 6. Mobile Application

Navigate to:

```bash
cd ../TheamaMobile
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npx expo start
```

## Project Structure

```text
THEAMA/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── theama-backend/
│   ├── src/
│   ├── setup.js
│   ├── package.json
│   └── .env.example
└── TheamaMobile/
```

## Environment Variables

The following environment variables need to be set in the `.env` file:

- `DB_HOST` - MariaDB host (default: localhost)
- `DB_PORT` - MariaDB port (default: 3306)
- `DB_USER` - MariaDB username (default: root)
- `DB_PASSWORD` - MariaDB password
- `DB_NAME` - Database name (default: theama)
- `PORT` - Node.js server port (default: 3000)

## Available Scripts

In the `theama-backend` directory, you can run:

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run setup` - Initialize and seed the database
