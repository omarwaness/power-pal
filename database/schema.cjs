const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

let db;

function ensureDb() {
  if (!db) {
    throw new Error("Database has not been initialized.");
  }

  return db;
}

function initDatabase(databasePath = path.join(process.cwd(), "sqlite.db")) {
  if (db) {
    return db;
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
  CREATE TABLE IF NOT EXISTS meter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meter_id INTEGER NOT NULL,
    date TEXT DEFAULT (date('now')),

    production REAL DEFAULT 0,
    consumption REAL DEFAULT 0,
    difference REAL DEFAULT 0,
    gas REAL DEFAULT 0,

    FOREIGN KEY (meter_id) REFERENCES meter(id) ON DELETE CASCADE
  );
`);

  return db;
}

const createMeter = ({ name }) => {
  return ensureDb().prepare(`
    INSERT INTO meter (name)
    VALUES (?)
  `).run(name);
};

const getMeters = () => {
  return ensureDb().prepare(`SELECT * FROM meter`).all();
};

const updateMeter = (id, { name }) => {
  return ensureDb().prepare(`
    UPDATE meter
    SET name = ?
    WHERE id = ?
  `).run(name, id);
};

const deleteMeter = (id) => {
  return ensureDb().prepare(`
    DELETE FROM meter
    WHERE id = ?
  `).run(id);
};

const createReading = ({
  meter_id,
  production,
  consumption,
  gas,
  date,
}) => {
  const difference = production - consumption;

  return ensureDb().prepare(`
    INSERT INTO readings (
      meter_id,
      date,
      production,
      consumption,
      difference,
      gas
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    meter_id,
    date || new Date().toISOString().split("T")[0],
    production,
    consumption,
    difference,
    gas
  );
};

const getReadings = (meterId) => {
  return ensureDb().prepare(`
    SELECT * FROM readings
    WHERE meter_id = ?
    ORDER BY date DESC
  `).all(meterId);
};

const getReadingsByMeterId = (meterId) => {
  return getReadings(meterId);
};

const updateReading = (id, { production, consumption, gas }) => {
  const difference = production - consumption;

  return ensureDb().prepare(`
    UPDATE readings
    SET production = ?,
        consumption = ?,
        difference = ?,
        gas = ?
    WHERE id = ?
  `).run(production, consumption, difference, gas, id);
};

const deleteReading = (id) => {
  return ensureDb().prepare(`
    DELETE FROM readings
    WHERE id = ?
  `).run(id);
};

module.exports = {
  initDatabase,
  createMeter,
  getMeters,
  updateMeter,
  deleteMeter,
  createReading,
  getReadings,
  getReadingsByMeterId,
  updateReading,
  deleteReading,
};