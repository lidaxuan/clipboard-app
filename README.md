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
