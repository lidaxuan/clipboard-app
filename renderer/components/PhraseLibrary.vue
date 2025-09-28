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
      <input v-model="newPhrase" placeholder="输入新话术..." @keyup.enter="addPhrase" maxlength="200"/>
      <button @click="addPhrase">添加</button>
    </div>

    <!-- 话术列表 -->
    <ul class="phrase-list">
      <li v-for="item in filteredPhrases" :key="item.id" class="phrase-item">
        <span class="text">{{ item.text }}</span>
        <div class="actions">
          <button @click.stop="copy(item.text)">复制</button>
          <button @click="editPhrase(item)">编辑</button>
          <button @click="deletePhrase(item.id)">删除</button>
          <button @click.stop="pin(item)">{{ item.pinned ? '取消置顶' : '置顶' }}</button>
          <button @click.stop="sendMessageMac(item.text)">发送</button>
        </div>
      </li>
    </ul>

    <Dialog ref="dialogRef" />
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from "vue"
import Message from "./Message/index.js";
import Dialog from "./Dialog.vue"
import sendMessageCommon from "./commonHandle.js";

const phrases = ref([]);
const newPhrase = ref("");
const dialogRef = ref();

const {selectedApp} = defineProps({
  selectedApp: String
});
// 组件加载时读取话术列表
onMounted(async () => {
  phrases.value = await window.electronAPI.getPhrases();

  window.electronAPI.onPhrasesUpdate((updatedPhrases) => {
    phrases.value = updatedPhrases;
  });
})

const filteredPhrases = computed(() => {
  return phrases.value.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return 0
      })
})

const pin = (item) => {
  item.pinned = !item.pinned
  window.electronAPI.togglePinPhrases(JSON.parse(JSON.stringify(item))) // 通知主进程更新 pinned 状态
}

const copy = (text) => {
  window.electronAPI.pasteHistory(text)
}

// 新增话术
async function addPhrase() {
  const text = newPhrase.value.trim();
  if (!text) return;
  if (phrases.value.length >= 100) {
    Message({message: "最多100条"})
    return;
  }
  phrases.value.push({id: Date.now(), text});
  await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
  newPhrase.value = "";
}

// 编辑话术
async function editPhrase(p) {
  dialogRef.value.open({
    title: "输入名称",
    showInput: true,
    defaultValue: p.text,
    onConfirm: async (text) => {
      if (text !== null) {
        p.text = text;
        await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
      }
    },
    onCancel: () => {
      console.log("用户取消输入")
    },
  })
}

// 删除话术
async function deletePhrase(id) {
  dialogRef.value.open({
    title: "确认操作",
    message: "确定要删除吗？",
    onConfirm: async () => {
      phrases.value = phrases.value.filter(p => p.id !== id)
      await window.electronAPI.setPhrases(JSON.parse(JSON.stringify(phrases.value)));
      Message({message: "删除成功"})
    },
    onCancel: () => {
      console.log("用户点击了取消")
    },
  });

}

// 发送话术
const sendMessageMac = (message) => {
  console.log("selectedApp", selectedApp)
  sendMessageCommon(selectedApp, message);
}
</script>


<style lang="scss" scoped>

.phrase-library {
  .add-box {
    display: flex;
    gap: 6px;
    padding: 10px 10px 0px;

    input {
      flex: 1;
      height: 30px;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-size: 14px;
    }
  }

  .phrase-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .phrase-item {
      background-color: white;
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 8px;
      }
    }
  }
}

</style>
