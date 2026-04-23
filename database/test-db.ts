import db from "./db";

// insert test data
db.prepare(`
  INSERT INTO usage (month, kwh, cost)
  VALUES (?, ?, ?)
`).run("2026-04", 150, 42);

// read data
const rows = db.prepare("SELECT * FROM usage").all();

console.log("DB TEST OUTPUT:", rows);