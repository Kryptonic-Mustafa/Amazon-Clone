// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Yahusain@128',
  database: process.env.DB_NAME || 'amazon_clone_db', // Make sure this matches your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});