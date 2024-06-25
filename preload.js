const { contextBridge, ipcRenderer } = require('electron');

// Preloads the different ipc renderers.
contextBridge.exposeInMainWorld('electronAPI', {
    addEntry: (title, content) => ipcRenderer.invoke('add-entry', title, content),
    getEntries: () => ipcRenderer.invoke('get-entries'),
    getEntry: (id) => ipcRenderer.invoke('get-entry', id),
    updateEntry: (id, title, content) => ipcRenderer.invoke('update-entry', id, title, content),
    deleteEntry: (id) => ipcRenderer.invoke('delete-entry', id)
});