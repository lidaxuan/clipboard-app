<template>
  <div class="app-container">
    <header>
      <h1>快话助手</h1>
      <div class="header-right">
        <div class="send-box">
          <label>
            <input type="radio" value="QQ" v-model="selectedApp"/> QQ
          </label>
          <label>
            <input type="radio" value="WeChat" v-model="selectedApp"/>微信
          </label>
          <label>
            <input type="radio" value="DingTalk" v-model="selectedApp"/>钉钉
          </label>
        </div>
        <button @click="clearHistory" class="clear-btn">清空历史( {{ getTabName }} )</button>
      </div>
    </header>

    <Tabs :tabs="tabs" @change="tabsChange" :key="tabKey" :defaultActive="activeTab" activeColor="#3498db">
      <template #default="{ activeTab }">
        <ClipboardView v-if="activeTab === 'clipboard'" :selected-app="selectedApp"/>

        <PhraseLibrary v-if="activeTab === 'phrases'" :selected-app="selectedApp"/>
      </template>
    </Tabs>

    <Dialog ref="dialogRef"/>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import ClipboardView from "./components/ClipboardView.vue";
import PhraseLibrary from "./components/PhraseLibrary.vue";
import Tabs from "./components/Tabs.vue";
import Dialog from "./components/Dialog.vue";

let selectedApp = ref('QQ')  // ✅ 定义这个响应式变量
const activeTab = ref("clipboard");
let tabKey = ref(Math.random());
const dialogRef = ref();

const tabs = [
  {key: 'clipboard', label: '剪贴板'},
  {key: 'phrases', label: '话术库'},
];

const getTabName = computed(() => {
  return tabs.find(item => item.key == activeTab.value).label;
});

// ✅ 清空（调用主进程）
const clearHistory = () => {
  dialogRef.value.open({
    title: "确认操作",
    message: "确定要删除吗？",
    onConfirm: async () => {
      if (activeTab.value == 'clipboard') {
        history.value = await window.electronAPI.clearHistory()
      } else {
        await window.electronAPI.setPhrases([]);
      }
      tabKey.value = Math.random();
    },
    onCancel: () => {
      console.log("用户点击了取消")
    },
  })

}

const formatText = (text) => {
  return text.replace(/\n/g, '⏎ ')
}
const tabsChange = (tab) => {
  console.log(tab);
  activeTab.value = tab.key;
}
</script>

<style lang="scss">
.app-container {
  font-family: 'Segoe UI', Roboto, sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f7;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 16px;
    background-color: #2c3e50;
    color: white;

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .send-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #fff;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #ccc;

    label {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #555;
      cursor: pointer;

      input[type="radio"] {
        margin-right: 4px;
        accent-color: #409eff;
      }
    }
  }

  .clear-btn {
    background-color: #e74c3c;
    border: none;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #c0392b;
    }
  }

  button {
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
}
</style>
