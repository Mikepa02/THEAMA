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

Edit the `.env` file and make sure it has all required variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=theama
PORT=3000
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

**Important:** Update `DB_PASSWORD` with your actual MariaDB root password.

### 4. Automatic Database Setup

Run the setup script to automatically create the database and load the schema and seed data:

```bash
npm run setup
```

This will:
- Create the MariaDB database (if it doesn't exist)
- Load the database schema from `database/schema.sql`
- Insert seed data from `database/seed.sql`
- **Pre-populate the admin user** (see credentials below)

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
│   ├── .env.example
│   └── .env
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
- Admin user creation

If you prefer manual setup, you can run the SQL files directly:

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql
```

## Admin Credentials

After running `npm run setup`, the admin account is automatically created with the following credentials:

- **Email:** `admin@theama.gr`
- **Password:** `admin123`

Use these credentials to log in to the admin panel in the mobile application.

## Environment Variables

The following environment variables need to be set in the `.env` file:

- `DB_HOST` - MariaDB host (default: localhost)
- `DB_PORT` - MariaDB port (default: 3306)
- `DB_USER` - MariaDB username (default: root)
- `DB_PASSWORD` - MariaDB password
- `DB_NAME` - Database name (default: theama)
- `PORT` - Node.js server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT token signing (must be set)
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 7d)

## Available Scripts

In the `theama-backend` directory, you can run:

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run setup` - Initialize and seed the database
