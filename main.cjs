const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "dist", "index.html"));
}

app.whenReady().then(createWindow);