// lib/db.ts
import mysql from 'mysql2/promise';

// Use DATABASE_URL if available (for production/TiDB), fallback to individual env vars for local dev
const connectionString = process.env.DATABASE_URL;

export const db = connectionString 
  ? mysql.createPool(connectionString)
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yahusain@128',
      database: process.env.DB_NAME || 'amazon_clone_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });