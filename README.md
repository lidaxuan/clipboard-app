npx electron-builder --win

# Mac 应用签名流程（证书助理版）

## 1. 打开证书助理

1. 打开 **钥匙串访问 (Keychain Access)**。

    * Spotlight 搜索 `钥匙串访问` 或 `Keychain Access`。
2. 在菜单栏选择：
   **钥匙串访问 → 证书助理 → 创建证书…**

---

## 2. 创建自签名证书

1. 在弹出的窗口中填写：

    * **名称**：例如 `Textor Self-Sign`
    * **身份类型**：`自签名根证书`
    * **证书类型**：`代码签名`
    * 勾选 “让此证书覆盖默认值”。
2. 点击 **继续**，一路确认直到完成。

---

## 3. 验证证书

1. 在钥匙串列表里找到新建的证书（通常在 **登录** → **证书** 下）。
2. 双击证书，在 **信任** 中将 “代码签名” 设置为 **始终信任**。
3. 关闭窗口 → 输入管理员密码保存。

---

## 4. 使用证书签名应用

1. 打开终端，输入命令：

   ```bash
   codesign --deep --force --sign "Textor Self-Sign" /路径/Textor.app
   ```

    * `"Textor Self-Sign"` 换成你创建的证书名字。
    * `/路径/Textor.app` 换成你实际的应用路径。 
    * `mdfind "kMDItemFSName == 'Textor.app'"` 查看 实际的应用路径。


2. 检查是否签名成功：

   ```bash
   codesign -dv --verbose=4 /路径/Textor.app
   ```

---

## 5. 分发给别人使用

* 别人直接双击可能会提示 “无法验证开发者”。
* 需要让他们右键 `打开`，然后在 **安全性与隐私** 里允许一次。
* 如果你只在团队内部使用，这样就够了。
* 如果需要 **完全避免提示** → 需要付费的 **Apple Developer ID** 来签名并公证（App Store 外发必走这个流程）。

---

## 6. 注意事项

* **自签名证书** 只能在你自己或团队机器上使用，分发给陌生用户会有安全提示。
* 如果要自动执行 `osascript`（AppleScript）控制键盘/应用 → 必须要有 **签名过的应用**，否则系统会拦截。


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
