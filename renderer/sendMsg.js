// sendMessageMac.js
import { exec } from "child_process";

/**
 * 自动发送消息到 Mac 上的 IM 软件
 * @param {"WeChat"|"QQ"|"DingTalk"} appName - 应用名
 * @param {string} contact - 联系人名称
 * @param {string} message - 消息内容
 */
function sendMessageMac(appName, contact, message) {
  if (!appName || !contact || !message) {
    console.error("appName、contact、message 都不能为空！");
    return;
  }

  // 转义双引号
  const contactEscaped = contact.replace(/"/g, '\\"');
  const messageEscaped = message.replace(/"/g, '\\"');

  const appleScript = `
    tell application "${appName}"
        activate
    end tell
    delay 0.5
    tell application "System Events"
        keystroke "${contactEscaped}"
        delay 0.2
        key code 36
        delay 0.2
        keystroke "${messageEscaped}"
        delay 0.1
        key code 36
    end tell
  `;

  exec(`osascript -e '${appleScript}'`, (err, stdout, stderr) => {
    if (err) {
      console.error("发送消息失败:", err);
    } else {
      console.log(`消息已发送给 ${contact} (${appName})`);
    }
  });
}

export default sendMessageMac;
