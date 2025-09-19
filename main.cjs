// main.cjs
const {app, BrowserWindow, clipboard, ipcMain, Tray, Menu, globalShortcut} = require('electron')
const path = require('path')

let Store, store
let win
let tray
let lastClipboardText = ''
let lastPastedText = ''

;(async () => {
  const mod = await import('electron-store')
  Store = mod.default
  store = new Store()

  // 创建窗口
  function createWindow() {
    const lastBounds = store.get('windowBounds') || {width: 400, height: 600, x: undefined, y: undefined}

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

    // 记住窗口大小和位置
    win.on('resize', saveWindowBounds)
    win.on('move', saveWindowBounds)
    win.once('ready-to-show', () => win.show())

    // 关闭时隐藏窗口
    win.on('close', (e) => {
      e.preventDefault()
      win.hide()
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

  // 清理过期历史
  function cleanExpiredHistory() {
    let history = store.get('history', [])
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    history = history.filter(item => item.createdAt >= startOfToday.getTime())
    store.set('history', history)
  }

  // 安全发送消息
  function safeSend(channel, ...args) {
    if (win && !win.isDestroyed() && win.webContents) {
      win.webContents.send(channel, ...args)
    }
  }

  // 剪贴板监听
  function startClipboardWatcher() {
    setInterval(() => {
      const text = clipboard.readText()
      if (!text || text.trim() === '' || text === lastClipboardText || text === lastPastedText) return

      lastClipboardText = text
      let history = store.get('history', [])

      // 删除旧位置，避免重复
      history = history.filter(item => item.text !== text)
      history.unshift({text, pinned: false, createdAt: Date.now()})

      // 只保留今天
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      history = history.filter(item => item.createdAt >= startOfToday.getTime())

      if (history.length > 50) history = history.slice(0, 50)

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
      {label: '显示窗口', click: () => win.show()},
      {label: '隐藏窗口', click: () => win.hide()},
      {label: '退出', click: () => app.quit()}
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
    globalShortcut.register('CommandOrControl+Shift+V', () => {
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

    let history = store.get('history', [])
    const index = history.findIndex(item => item.text === text)
    let clickedItem
    if (index !== -1) {
      clickedItem = history.splice(index, 1)[0]
    } else {
      clickedItem = {
        text, pinned: false, createdAt: Date.now()
      }
    }
    history.unshift(clickedItem)
    store.set('history', history)
    if (win && win.webContents) {
      win.webContents.send('clipboard-changed', text)
      win.webContents.send('history-updated', history)
    }
  })

  ipcMain.on('toggle-pin', (_e, text) => {
    let history = store.get('history', [])
    const idx = history.findIndex(item => item.text === text)
    if (idx !== -1) {
      history[idx].pinned = !history[idx].pinned
      // 置顶排序
      history.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return b.createdAt - a.createdAt
      })
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

  // macOS Dock 点击激活
  app.on('activate', () => {
    if (!win || win.isDestroyed()) createWindow()
    else win.show()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
})()
