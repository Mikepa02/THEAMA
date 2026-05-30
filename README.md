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

### 4. Automatic Database Setup

Run the setup script to automatically create the database and load the schema and seed data:

```bash
npm run setup
```

This will:
- Create the MariaDB database (if it doesn't exist)
- Load the database schema from `database/schema.sql`
- Insert seed data from `database/seed.sql`

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

## Database Setup

The database setup is fully automated. Just run:

```bash
npm run setup
```

This will handle:
- Database creation
- Schema initialization
- Initial data seeding

If you prefer manual setup, you can run the SQL files directly:

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql
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

