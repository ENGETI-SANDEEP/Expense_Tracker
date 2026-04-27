import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite database (will create if it doesn't exist)
const dbPath = path.resolve(__dirname, '../data.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    idempotency_key TEXT UNIQUE
  );
`);

console.log('Database initialized at', dbPath);
