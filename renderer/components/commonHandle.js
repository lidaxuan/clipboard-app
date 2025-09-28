// src/utils/messageQueue.js

let sendQueue = [];
let sending = false;

// 统一发送接口
function enqueueMessage(appName, message) {
  const lastMsg = sendQueue.length ? sendQueue[sendQueue.length - 1].message : null;
  if (lastMsg === message) return; // 连续重复消息忽略
  sendQueue.push({appName, message});
  sendNext();
}

// 发送队列中的下一条
async function sendNext() {
  if (sending || sendQueue.length === 0) return;

  sending = true;
  const {appName, message} = sendQueue.shift();
  console.log(11, appName, message);
  await window.electronAPI.sendMsg({appName, message})
  sending = false;
  sendNext(); // 下一条
}

// 对外统一调用接口（可加防抖）
function sendMessageCommon(appName, message) {
  enqueueMessage(appName, message);
}

export default sendMessageCommon
