// main.cjs
const { app, BrowserWindow, clipboard, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const path = require('path')
const Store = require('electron-store')
const store = new Store()
const { exec } = require('child_process');

let win
let tray
let lastClipboardText = ''
let lastPastedText = '';
(async () => {
  // 创建窗口
  function createWindow() {
    const lastBounds = store.get('windowBounds') || { width: 400, height: 600, x: undefined, y: undefined }

    win = new BrowserWindow({
      width: lastBounds.width,
      height: lastBounds.height,
      minWidth: 500,
      minHeight: 500,
      // maxWidth: 600,
      // maxHeight: 700,
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
  let clipboardWatcherRunning = false;
  let stopClipboardWatcher = false;

  function startClipboardWatcher() {
    if (clipboardWatcherRunning) return; // 避免重复启动
    stopClipboardWatcher = false;
    clipboardWatcherRunning = true;

    const loop = async () => {
      if (stopClipboardWatcher) {
        clipboardWatcherRunning = false;
        return;
      }

      try {
        const enabled = store.get("enableClipboard", true);
        if (enabled) {
          const text = clipboard.readText();
          if (text && text.trim() !== "" && text !== lastClipboardText && text !== lastPastedText) {
            lastClipboardText = text;
            let history = store.get("history", []);
            history = insertHistoryItem(history, {
              text,
              pinned: false,
              createdAt: Date.now(),
            });

            store.set("history", history);
            safeSend("clipboard-changed", text);
            safeSend("history-updated", history);
          }
        }
      } catch (e) {
        console.error("Clipboard watcher error:", e);
      }

      // 用 setTimeout 而不是 setInterval，避免重叠
      setTimeout(loop, 1000);
    };

    loop();
  }

  function stopClipboardWatcherFn() {
    stopClipboardWatcher = true;
  }


  app.whenReady().then(() => {
    console.log(store.store)
    store.clear();
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

  ipcMain.on('send-message', (_e, { appName, message }) => {
    if (!appName || !message) return;

    const messageEscaped = message.replace(/"/g, '\\"');

    // 唤醒应用
    exec(`open -a "${appName}"`, (err) => {
      if (err) return console.error('无法唤醒应用', err);

      // 延时确保应用前台
      setTimeout(() => {
        let sendKey = 'key code 36'; // 默认回车
        if (appName === 'QQ') sendKey = 'keystroke return'; // QQ 特殊处理

        const lines = [
          'tell application "System Events"',
          `tell process "${appName}"`,
          'set frontmost to true',
          'delay 0.5',
          'key code 51 using {command down}',      // 清空输入框
          'set the clipboard to ""',               // 清空剪贴板
          `delay 0.1`,
          `set the clipboard to "${messageEscaped}"`,
          'delay 0.2',
          'keystroke "v" using {command down}',   // 粘贴消息
          'delay 0.3',
          sendKey,                                // 回车发送
          'end tell',
          'end tell'
        ];

        const appleScript = lines.map(line => `-e '${line}'`).join(' ');

        exec(`osascript ${appleScript}`, (err2) => {
          if (err2) console.error('发送失败', err2);
          else console.log(`消息已发送给 ${messageEscaped} (${appName})`);
        });
      }, 100);
    });
  });


  ipcMain.handle("get-phrases", () => {
    return store.get("phrases", []);
  });

  ipcMain.handle("set-phrases", (_e, phrases) => {
    store.set("phrases", phrases);
    return true;
  });

  ipcMain.on('toggle-pin-phrases', (_e, row) => {
    let phrases = store.get('phrases', [])
    const idx = phrases.findIndex(item => item.id === row.id)
    if (idx !== -1) {
      phrases[idx].pinned = !phrases[idx].pinned;
      store.set('phrases', phrases);
      safeSend('phrases-updated', phrases);
    }
  });


  ipcMain.handle("get-enableClipboard", () => {
    return store.get("enableClipboard", true);
  });

  ipcMain.handle("set-enableClipboard", (_e, val) => {
    store.set("enableClipboard", val);
    if (val) {
      startClipboardWatcher();
    } else {
      stopClipboardWatcherFn();
    }
    // return true;
  });



  app.on('activate', () => {
    if (!win || win.isDestroyed()) createWindow()
    else win.show()
  });

  app.on('window-all-closed', () => {
    app.quit()
  });

})();
