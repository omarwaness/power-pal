import Database from "better-sqlite3";
import path from "path";

// SQLite file in root
const db = new Database(path.join(process.cwd(), "sqlite.db"));

// init schema
db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    kwh REAL,
    cost REAL
  )
`);

export default db;