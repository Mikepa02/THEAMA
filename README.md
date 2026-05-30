# THEAMA

## Project Overview
THEAMA is a theatre booking and management platform consisting of:

- Mobile application (TheamaMobile)
- Backend API (Node.js)
- MySQL database

## Technologies Used
- Node.js
- Express.js
- MySQL
- React Native / Expo
- JavaScript

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd theama
```

### 2. Database Setup

Create a MySQL database and execute:

```sql
database/schema.sql
database/seed.sql
```

### 3. Backend Setup

Navigate to:

```bash
cd theama-backend
```

Install dependencies:

```bash
npm install
```

Configure the `.env` file with the appropriate database credentials.

Start the backend:

```bash
npm start
```

### 4. Mobile Application

Navigate to:

```bash
cd TheamaMobile
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
theama/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── theama-backend/
└── TheamaMobile/
```

## Initial Data

The database is populated using:

- schema.sql
- seed.sql

These files create the required tables and insert the initial records.

## Academic Submission

This repository was developed as part of a university software development project.

Author: Mike
