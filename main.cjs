// main.cjs
const { app, BrowserWindow, clipboard, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const path = require('path')
const Store = require('electron-store')
const store = new Store()

let win
let tray
let lastClipboardText = ''
let lastPastedText = ''

;(async () => {
  // 创建窗口
  function createWindow() {
    const lastBounds = store.get('windowBounds') || { width: 400, height: 600, x: undefined, y: undefined }

    win = new BrowserWindow({
      width: lastBounds.width,
      height: lastBounds.height,
      x: lastBounds.x,
      y: lastBounds.y,
      icon: process.platform === 'win32' ? path.join(__dirname, 'icon.ico') : path.join(__dirname, 'icon.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    win.on('resize', saveWindowBounds)
    win.on('move', saveWindowBounds)

    win.on('close', () => {
      app.quit()
    })

    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:5173')
      win.webContents.once('did-finish-load', () => {
        win.webContents.openDevTools()
      })
    } else {
      win.loadFile(path.join(__dirname, 'dist/index.html'))
    }
  }

  function saveWindowBounds() {
    if (win && !win.isDestroyed()) {
      const bounds = win.getBounds()
      store.set('windowBounds', bounds)
    }
  }

  // 清理过期历史（只保留今天）
  function cleanExpiredHistory() {
    let history = store.get('history', [])
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    history = history.filter(item => item.createdAt >= startOfToday.getTime())
    store.set('history', history)
  }

  function safeSend(channel, ...args) {
    if (win && !win.isDestroyed() && win.webContents) {
      win.webContents.send(channel, ...args)
    }
  }

  // 插入历史记录（保持置顶在上面）
  function insertHistoryItem(history, item) {
    // 删除旧位置
    history = history.filter(h => h.text !== item.text)

    const pinnedItems = history.filter(h => h.pinned)
    const normalItems = history.filter(h => !h.pinned)

    // 新内容插入到普通区最前
    normalItems.unshift(item)

    // 只保留今天
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    let newHistory = [...pinnedItems, ...normalItems].filter(h => h.createdAt >= startOfToday.getTime())

    // 限制 50 条
    if (newHistory.length > 50) {
      newHistory = [...pinnedItems, ...normalItems].slice(0, 50)
    }

    return newHistory
  }

  // 剪贴板监听
  function startClipboardWatcher() {
    setInterval(() => {
      const text = clipboard.readText()
      if (!text || text.trim() === '' || text === lastClipboardText || text === lastPastedText) return

      lastClipboardText = text
      let history = store.get('history', [])
      history = insertHistoryItem(history, { text, pinned: false, createdAt: Date.now() })

      store.set('history', history)
      safeSend('clipboard-changed', text)
      safeSend('history-updated', history)
    }, 1000)
  }

  app.whenReady().then(() => {
    cleanExpiredHistory()
    createWindow()
    startClipboardWatcher()

    // 托盘
    tray = new Tray(process.platform === 'win32' ? path.join(__dirname, 'icon.ico') : path.join(__dirname, 'icon.png'))
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示窗口', click: () => win.show() },
      { label: '隐藏窗口', click: () => win.hide() },
      { label: '退出', click: () => app.quit() }
    ])
    tray.setToolTip('剪贴板助手')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      if (win.isVisible()) win.hide()
      else {
        win.show()
        win.focus()
      }
    })

    // 全局快捷键
    globalShortcut.register('CommandOrControl+Shift+Alt+V', () => {
      if (win.isVisible()) win.hide()
      else {
        win.show()
        win.focus()
      }
    })
  })

  // IPC
  ipcMain.handle('get-history', () => {
    let history = store.get('history', [])
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return history.filter(item => item.createdAt >= startOfToday.getTime())
  })

  ipcMain.handle('clear-history', () => {
    store.set('history', [])
    return []
  })

  ipcMain.on('set-last-pasted-text', (_e, text) => {
    lastPastedText = text
  })

  ipcMain.on('paste-history', (_e, text) => {
    if (!text) return
    clipboard.writeText(text)
    lastPastedText = text

    // let history = store.get('history', [])
    // history = insertHistoryItem(history, { text, pinned: false, createdAt: Date.now() })
    //
    // store.set('history', history)
    // safeSend('history-updated', history)
  })

  ipcMain.on('toggle-pin', (_e, text) => {
    let history = store.get('history', [])
    const idx = history.findIndex(item => item.text === text)
    if (idx !== -1) {
      history[idx].pinned = !history[idx].pinned
      store.set('history', history)
      safeSend('history-updated', history)
    }
  })

  ipcMain.on('delete-history-item', (_e, text) => {
    let history = store.get('history', [])
    history = history.filter(item => item.text !== text)
    store.set('history', history)
    safeSend('history-updated', history)
  })

  app.on('activate', () => {
    if (!win || win.isDestroyed()) createWindow()
    else win.show()
  })

  app.on('window-all-closed', () => {
    app.quit()
  })
})()
