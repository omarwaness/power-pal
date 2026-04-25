const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const {
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
} = require("./database/schema.cjs");

function registerIpcHandlers() {
  ipcMain.handle("meter:create", (_event, payload) => createMeter(payload));
  ipcMain.handle("meter:list", () => getMeters());
  ipcMain.handle("meter:update", (_event, id, payload) => updateMeter(id, payload));
  ipcMain.handle("meter:delete", (_event, id) => deleteMeter(id));

  ipcMain.handle("reading:create", (_event, payload) => createReading(payload));
  ipcMain.handle("reading:list", (_event, meterId) => getReadings(meterId));
  ipcMain.handle("reading:listByMeterId", (_event, meterId) => getReadingsByMeterId(meterId));
  ipcMain.handle("reading:update", (_event, id, payload) => updateReading(id, payload));
  ipcMain.handle("reading:delete", (_event, id) => deleteReading(id));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "scripts", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
    return;
  }

  win.loadURL("http://localhost:5173/");
}

app.whenReady().then(() => {
  const databasePath = path.join(app.getPath("userData"), "powerpal.sqlite");

  initDatabase(databasePath);
  registerIpcHandlers();
  createWindow();
});