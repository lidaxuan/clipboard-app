<template>
  <div class="app-container">
    <header>
      <h1>剪贴板助手</h1>
      <button @click="clearHistory" class="clear-btn">清空历史</button>
    </header>

    <main>
      <ul class="history-list">
        <li v-for="item in filteredHistory" :key="item.text" class="history-item">
          <span class="text" :title="item.text">{{ item.text }}</span>
          <div class="actions">
            <button @click.stop="copy(item.text)">复制</button>
            <button @click.stop="pin(item)">
              {{ item.pinned ? '取消置顶' : '置顶' }}
            </button>
            <button @click.stop="deleteHistoryItem(item.text)">删除</button>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const history = ref([])   // { text: string, pinned: boolean }
const keyword = ref('')
const currentClipboard = ref('')  // ✅ 定义这个响应式变量

// ✅ 使用 filteredHistory 来保证置顶排最前
const filteredHistory = computed(() => {
  return history.value
      .filter(item => item.text.toLowerCase().includes(keyword.value.toLowerCase()))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return 0
      })
})

window.electronAPI.onHistoryUpdate((updatedHistory) => {
  history.value = updatedHistory; // 立即更新UI
});

// ✅ 启动时加载历史
onMounted(async () => {
  const storedHistory = await window.electronAPI.getHistory();
  history.value = storedHistory || [];

  window.electronAPI.onHistoryUpdate((updatedHistory) => {
    history.value = updatedHistory;
  });

  window.electronAPI.onClipboardChange((text) => {
    currentClipboard.value = text;
  });
});

const copy = (text) => {
  window.electronAPI.pasteHistory(text)
}

// ✅ 改造 pin，不会产生复制问题
const pin = (item) => {
  item.pinned = !item.pinned
  window.electronAPI.togglePin(item.text) // 通知主进程更新 pinned 状态
}

const deleteHistoryItem = (text) => {
  window.electronAPI.deleteHistoryItem(text)
}

// ✅ 清空（调用主进程）
const clearHistory = async () => {
  history.value = await window.electronAPI.clearHistory()
}

const formatText = (text) => {
  return text.replace(/\n/g, '⏎ ')
}
</script>

<style>
.app-container {
  font-family: 'Segoe UI', Roboto, sans-serif;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f7;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #2c3e50;
  color: white;
}

.clear-btn {
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn:hover {
  background-color: #c0392b;
}


.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  background-color: white;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.history-item .text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px;
}

.actions button {
  margin-left: 4px;
  padding: 4px 8px;
  font-size: 0.85rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  transition: background-color 0.2s;
}

.actions button:hover {
  background-color: #2980b9;
}

</style>
