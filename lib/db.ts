// lib/db.ts
import mysql from 'mysql2/promise';

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

// Production (Vercel + TiDB): use DATABASE_URL with mandatory SSL
// Development (local): use local MySQL, ignore DATABASE_URL
export const db = (isProduction && connectionString)
  ? mysql.createPool({
      uri: connectionString,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    })
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yahusain@128',
      database: process.env.DB_NAME || 'amazon_clone_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });