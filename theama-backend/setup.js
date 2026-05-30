const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('🔧 Starting database setup...\n');

        // Create connection without specifying database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        console.log('✅ Connected to MariaDB\n');

        // Create database if it doesn't exist
        console.log(`📦 Creating database "${process.env.DB_NAME}" if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
        console.log('✅ Database ready\n');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME};`);

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📋 Loading schema...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            // Split by semicolon and execute each statement
            const statements = schemaSql.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
            console.log('✅ Schema created\n');
        } else {
            console.warn('⚠️  schema.sql not found\n');
        }

        // Read and execute seed.sql
        const seedPath = path.join(__dirname, '../database/seed.sql');
        if (fs.existsSync(seedPath)) {
            console.log('🌱 Loading seed data...');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            const seedStatements = seedSql.split(';').filter(stmt => stmt.trim());
            for (const statement of seedStatements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
            console.log('✅ Seed data inserted\n');
        } else {
            console.warn('⚠️  seed.sql not found\n');
        }

        await connection.end();
        console.log('🎉 Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
