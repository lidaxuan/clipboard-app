<!--
 * @Description: 话术库
 * @Author: lidaxuan
 * @Date: 2025-09-25 18:56:11
 * @FilePath: renderer/components/PhraseLibrary.vue
 * @LastEditors: lijixuan
 * @LastEditTime: 2025-09-25 18:56:11
-->
<template>
  <div class="phrase-library">
    <!-- 新增输入框 -->
    <div class="add-box">
      <input v-model="newPhrase" placeholder="输入新话术..." @keyup.enter="addPhrase" />
      <button @click="addPhrase">添加</button>
    </div>

    <!-- 话术列表 -->
    <ul class="phrase-list">
      <li v-for="p in phrases" :key="p.id" class="phrase-item">
        <span class="text" @click="sendPhrase(p.text)">{{ p.text }}</span>
        <div class="actions">
          <button @click="editPhrase(p)">✏️</button>
          <button @click="deletePhrase(p.id)">🗑</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const phrases = ref([])
const newPhrase = ref("")
const selectedApp = ref("WeChat") // 从父组件传入也可以

// 组件加载时读取话术列表
onMounted(async () => {
  phrases.value = await window.electronAPI.getPhrases()
})

// 新增话术
async function addPhrase() {
  const text = newPhrase.value.trim();
  if (!text) return;
  phrases.value.push({ id: Date.now(), text });
  await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
  newPhrase.value = "";
}

// 编辑话术
async function editPhrase(p) {
  const text = prompt("修改话术：", p.text);
  if (text !== null) {
    p.text = text;
    await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
  }
}

// 删除话术
async function deletePhrase(id) {
  phrases.value = phrases.value.filter(p => p.id !== id)
  await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
}

// 发送话术
async function sendPhrase(text) {
  await window.electronAPI.sendMessage({
    appName: selectedApp.value,
    message: text
  })
}
</script>


<style scoped>
.add-box {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.add-box input {
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}
.add-box button {
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
}
.add-box button:hover {
  background-color: #36a373;
}

.phrase-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.phrase-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 14px;
  transition: background 0.2s;
}
.phrase-item:hover {
  background: #f1f1f1;
}
.phrase-item .text {
  flex: 1;
  cursor: pointer;
}
.phrase-item .actions button {
  margin-left: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
</style>
