const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  pasteHistory: (text) => ipcRenderer.send('paste-history', text),
  togglePin: (text) => ipcRenderer.send('toggle-pin', text),
  onClipboardChange: (cb) => ipcRenderer.on('clipboard-changed', cb),
  onHistoryUpdate: (cb) => ipcRenderer.on('history-updated', (_e, data) => cb(data)),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  deleteHistoryItem: (text) => ipcRenderer.send('delete-history-item', text),
  sendMsg: ({ appName, contact, message }) => ipcRenderer.send('send-message', { appName, contact, message })
})
