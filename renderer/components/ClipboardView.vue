<template>
  <div>
<!--    <button @click="clearHistory">清空历史</button>-->
    <ul class="history-list">
      <li v-for="item in filteredHistory" :key="item.text" class="history-item">
        <span class="text" :title="item.text">{{ item.text }}</span>
        <div class="actions">
          <button @click.stop="copy(item.text)">复制</button>
          <button @click.stop="pin(item)">
            {{ item.pinned ? '取消置顶' : '置顶' }}
          </button>
          <button @click.stop="deleteHistoryItem(item.text)">删除</button>
          <button @click.stop="sendMessageMac(item.text)">发送</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue"

const props = defineProps({
  selectedApp: String
});
const history = ref([]);   // { text: string, pinned: boolean }
const keyword = ref('')

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


const copy = (text) => {
  window.electronAPI.pasteHistory(text)
}

// ✅ 改造 pin，不会产生复制问题
const pin = (item) => {
  item.pinned = !item.pinned
  window.electronAPI.togglePin(item.text) // 通知主进程更新 pinned 状态
}

const sendMessageMac = (message) => {
  window.electronAPI.sendMsg({appName: selectedApp.value, message});
}

const deleteHistoryItem = (text) => {
  window.electronAPI.deleteHistoryItem(text)
}


function clearHistory() {
  history.value = []
}
</script>
