import db from "./schema";

// Insert sample meter
const meterId = db.prepare(`
  INSERT INTO meter (name)
  VALUES (?)
`).run("Main Meter").lastInsertRowid;

// Insert sample readings
db.prepare(`
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
  meterId,
  "12-04-2026",
  120,
  100,
  20,
  5
);

// Read data
const rows = db.prepare(`
  SELECT 
    m.id as meter_id,
    m.name,
    r.date,
    r.production,
    r.consumption,
    r.difference,
    r.gas
  FROM meter m
  JOIN readings r ON m.id = r.meter_id
`).all();

console.log("DB TEST OUTPUT:", rows);