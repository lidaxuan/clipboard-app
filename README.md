npx electron-builder --win

```javascript
  const appleScript = `
  tell application "System Events"
    tell process "${appName}"
      set frontmost to true
      delay 0.5

      -- 先清空输入框
      key code 51 using {command down} -- command + delete（删除整行内容）
      delay 0.1

      -- 设置剪贴板内容
      set the clipboard to "${message}"
      delay 0.1

      -- 粘贴
      keystroke "v" using {command down}
      delay 0.1

      -- 回车发送
      key code 36
    end tell
  end tell
`;
```

DEMO
```vue
<template>
  <div>
    <button @click="openConfirm">确认对话框</button>
    <button @click="openPrompt">输入框对话框</button>

    <Dialog ref="dialogRef" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import Dialog from "./Dialog.vue";

const dialogRef = ref();

function openConfirm() {
  dialogRef.value.open({
    title: "确认操作",
    message: "确定要删除吗？",
    onConfirm: () => {
      console.log("用户点击了确定")
    },
    onCancel: () => {
      console.log("用户点击了取消")
    },
  })
}

function openPrompt() {
  dialogRef.value.open({
    title: "输入名称",
    showInput: true,
    defaultValue: "默认内容",
    onConfirm: (val) => {
      console.log("用户输入：", val)
    },
    onCancel: () => {
      console.log("用户取消输入")
    },
  })
}
</script>

```
