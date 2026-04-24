const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "sqlite.db"));

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

const createMeter = ({ name }) => {
  return db.prepare(`
    INSERT INTO meter (name)
    VALUES (?)
  `).run(name);
};

const getMeters = () => {
  return db.prepare(`SELECT * FROM meter`).all();
};

const updateMeter = (id, { name }) => {
  return db.prepare(`
    UPDATE meter
    SET name = ?
    WHERE id = ?
  `).run(name, id);
};

const deleteMeter = (id) => {
  return db.prepare(`
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

  return db.prepare(`
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
  return db.prepare(`
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

  return db.prepare(`
    UPDATE readings
    SET production = ?,
        consumption = ?,
        difference = ?,
        gas = ?
    WHERE id = ?
  `).run(production, consumption, difference, gas, id);
};

const deleteReading = (id) => {
  return db.prepare(`
    DELETE FROM readings
    WHERE id = ?
  `).run(id);
};

module.exports = {
  db,
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