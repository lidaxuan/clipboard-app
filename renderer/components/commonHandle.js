
export const copy = (text) => {
  window.electronAPI.pasteHistory(text)
}

// ✅ 改造 pin，不会产生复制问题
export const pin = (item) => {
  item.pinned = !item.pinned
  window.electronAPI.togglePin(item.text) // 通知主进程更新 pinned 状态
}

export const sendMessageMac = (message) => {
  window.electronAPI.sendMsg({appName: selectedApp.value, message});
}

export const deleteHistoryItem = (text) => {
  window.electronAPI.deleteHistoryItem(text)
}
