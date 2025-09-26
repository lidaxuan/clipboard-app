const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  pasteHistory: (text) => ipcRenderer.send('paste-history', text),
  togglePin: (text) => ipcRenderer.send('toggle-pin', text),

  onClipboardChange: (cb) => ipcRenderer.on('clipboard-changed', cb),
  onHistoryUpdate: (cb) => ipcRenderer.on('history-updated', (_e, data) => cb(data)),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  deleteHistoryItem: (text) => ipcRenderer.send('delete-history-item', text),
  sendMsg: (obj) => ipcRenderer.send('send-message', obj),

  // 获取话术列表
  getPhrases: () => ipcRenderer.invoke("get-phrases"),
  // 设置/保存话术列表
  setPhrases: (phrases) => ipcRenderer.invoke("set-phrases", phrases), // 发送消息
  sendMessage: (data) => ipcRenderer.invoke("send-message", data),
  togglePinPhrases: (text) => ipcRenderer.send('toggle-pin-phrases', text),
  onPhrasesUpdate: (cb) => ipcRenderer.on('phrases-updated', (_e, data) => cb(data)),

  getEnableClipboard: () => ipcRenderer.invoke("get-enableClipboard"),
  // 设置/保存话术列表
  setEnableClipboard: (val) => ipcRenderer.invoke("set-enableClipboard", val),

})
