const { app, BrowserWindow, ipcMain } = require('electron');
// const electronReload = require('electron-reload');
const path = require('path');
const database = require('./src/database');

const registeredHandlers = new Set();

// Set up electron-reload
// electronReload(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Register your handlers here
  function safeHandle(channel, handler) {
    if (!registeredHandlers.has(channel)) {
      ipcMain.handle(channel, handler);
      registeredHandlers.add(channel);
    }
  }

  // Now use this function to register your handlers
  safeHandle('add-entry', (event, title, content) => {
    return new Promise((resolve, reject) => {
      database.addEntry(title, content, (err, id) => {
        if (err) reject(err);
        else resolve(id);
      });
    });
  });
  
  safeHandle('get-entries', () => {
    return new Promise((resolve, reject) => {
      database.getEntries((err, entries) => {
        if (err) reject(err);
        else resolve(entries);
      });
    });
  });
  
  safeHandle('get-entry', (event, id) => {
    return new Promise((resolve, reject) => {
      database.getEntry(id, (err, entry) => {
        if (err) reject(err);
        else resolve(entry);
      });
    });
  });
  
  safeHandle('update-entry', (event, id, title, content) => {
    return new Promise((resolve, reject) => {
      database.updateEntry(id, title, content, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  });
  
  safeHandle('delete-entry', (event, id) => {
    return new Promise((resolve, reject) => {
      database.deleteEntry(id, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  registeredHandlers.forEach(channel => {
    ipcMain.removeHandler(channel);
  });
  registeredHandlers.clear();
});