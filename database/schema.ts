import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type { MeterRequest, MeterResponse } from "../types/meter";
import type { ReadingRequest, ReadingResponse } from "../types/readings";

let db: Database.Database | null = null;

function ensureDb(): Database.Database {
  if (!db) {
    throw new Error("Database has not been initialized.");
  }

  return db;
}

export function initDatabase(databasePath = path.join(process.cwd(), "sqlite.db")) {
  if (db) {
    return db;
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // SCHEMA
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

// METER CRUD
export const createMeter = ({ name }: MeterRequest) => {
  return ensureDb().prepare(`
    INSERT INTO meter (name)
    VALUES (?)
  `).run(name);
};

export const getMeters = (): MeterResponse[] => {
  return ensureDb().prepare(`SELECT * FROM meter`).all() as MeterResponse[];
};

export const updateMeter = (id: number, { name }: MeterRequest) => {
  return ensureDb().prepare(`
    UPDATE meter
    SET name = ?
    WHERE id = ?
  `).run(name, id);
};

export const deleteMeter = (id: number) => {
  return ensureDb().prepare(`
    DELETE FROM meter
    WHERE id = ?
  `).run(id);
};

// READINGS CRUD
export const createReading = ({
  meter_id,
  production,
  consumption,
  gas,
  date,
}: ReadingRequest) => {
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

export const getReadings = (meter_id: number): ReadingResponse[] => {
  return ensureDb().prepare(`
    SELECT * FROM readings
    WHERE meter_id = ?
    ORDER BY date DESC
  `).all(meter_id) as ReadingResponse[];
};

export const getReadingsByMeterId = (meter_id: number): ReadingResponse[] => {
  return getReadings(meter_id);
};

export const updateReading = (
  id: number,
  { production, consumption, gas }: Pick<ReadingRequest, "production" | "consumption" | "gas">
) => {
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

export const deleteReading = (id: number) => {
  return ensureDb().prepare(`
    DELETE FROM readings
    WHERE id = ?
  `).run(id);
};

export function getDatabase() {
  return ensureDb();
}

export default getDatabase;