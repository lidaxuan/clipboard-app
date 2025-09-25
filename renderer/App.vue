<template>
  <div class="app-container">
    <header>
      <h1>快话助手</h1>
      <div class="header-right">
        <div class="send-box">
          <label>
            <input type="radio" value="WeChat" v-model="selectedApp" />微信
          </label>
          <label>
            <input type="radio" value="QQ" v-model="selectedApp" /> QQ
          </label>
          <label>
            <input type="radio" value="DingTalk" v-model="selectedApp" />钉钉
          </label>
        </div>
        <button @click="clearHistory" class="clear-btn">清空历史</button>
      </div>
    </header>

    <!-- Tab 切换 -->
    <nav class="tabs">
      <button :class="{active: activeTab === 'clipboard'}" @click="activeTab = 'clipboard'">
        剪贴板
      </button>
      <button :class="{active: activeTab === 'phrases'}" @click="activeTab = 'phrases'">
        话术库
      </button>
    </nav>

    <!-- 内容区，动态加载 -->
    <main class="tab-content">
      <ClipboardView v-if="activeTab === 'clipboard'" :key="activeTab" :selected-app="selectedApp" />

      <PhraseLibrary v-if="activeTab === 'phrases'" :selected-app="selectedApp" />
    </main>

<!--    <main>-->
<!--      <ul class="history-list">-->
<!--        <li v-for="item in filteredHistory" :key="item.text" class="history-item">-->
<!--          <span class="text" :title="item.text">{{ item.text }}</span>-->
<!--          <div class="actions">-->
<!--            <button @click.stop="copy(item.text)">复制</button>-->
<!--            <button @click.stop="pin(item)">-->
<!--              {{ item.pinned ? '取消置顶' : '置顶' }}-->
<!--            </button>-->
<!--            <button @click.stop="deleteHistoryItem(item.text)">删除</button>-->
<!--            <button @click.stop="sendMessageMac(item.text)">发送</button>-->
<!--          </div>-->
<!--        </li>-->
<!--      </ul>-->
<!--    </main>-->
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import ClipboardView from "./components/ClipboardView.vue";
import PhraseLibrary from "./components/PhraseLibrary.vue";

const activeTab = ref("clipboard")



const currentClipboard = ref('')  // ✅ 定义这个响应式变量
let selectedApp = ref('WeChat')  // ✅ 定义这个响应式变量


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
  padding: 20px 16px;
  background-color: #2c3e50;
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.send-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.send-box label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.send-box input[type="radio"] {
  margin-right: 4px;
  accent-color: #409eff; /* 美化选中颜色 */
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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



.tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
  background: #f9f9f9;
}
.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
}
.tabs button.active {
  border-bottom: 2px solid #42b983;
  font-weight: bold;
  color: #42b983;
}
.tab-content {
  padding: 10px;
}

</style>
