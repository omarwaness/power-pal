const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  Menu.setApplicationMenu(null);

  win.loadURL("http://localhost:5173/");
}

app.whenReady().then(createWindow);