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

    <Dialog ref="dialogRef" />
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import Message from "./Message/index.js";
import Dialog from "./Dialog.vue";

const {selectedApp} = defineProps({
  selectedApp: String
});

const currentClipboard = ref('');  // ✅ 定义这个响应式变量
const history = ref([]);   // { text: string, pinned: boolean }
const keyword = ref('');
const dialogRef = ref();

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
  console.log("selectedApp", selectedApp)
  window.electronAPI.sendMsg({appName: selectedApp, message});
}

const deleteHistoryItem = (text) => {
  dialogRef.value.open({
    title: "确认操作",
    message: "确定要删除吗？",
    onConfirm: () => {
      window.electronAPI.deleteHistoryItem(text);
      Message({message: "删除成功"});
    },
    onCancel: () => {
      console.log("用户点击了取消")
    },
  })

}

</script>

<style lang="scss">
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  .history-item {
    background-color: white;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

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
      &n:hover {
        background-color: #2980b9;
      }
    }

    .text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 8px;
    }
  }
}

</style>
