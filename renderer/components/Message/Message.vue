<template>
  <div
      class="message-container"
      :class="{'message-fade-in': visible, 'message-fade-out': !visible}"
      :style="{ top: `${topOffset}px` }"
  >
    <div class="message-icon">
      <i class="icon-info"></i>
    </div>
    <div class="message-content">
      {{ message }}
    </div>
    <button
        class="message-close"
        @click="close"
        v-if="showClose"
    >
      <i class="icon-close"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,defineEmits } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
    description: '消息内容'
  },
  duration: {
    type: Number,
    default: 3000,
    description: '显示时长(毫秒)'
  },
  showClose: {
    type: Boolean,
    default: false,
    description: '是否显示关闭按钮'
  },
  topOffset: {
    type: Number,
    default: 20,
    description: '顶部偏移量'
  }
});

const emit = defineEmits(['close']);

// 控制显示状态
const visible = ref(false);
// 定时器
let timer = null;

// 组件挂载时显示消息
onMounted(() => {
  // 触发进入动画
  visible.value = true;

  // 设置自动关闭定时器
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
});

// 关闭消息
const close = () => {
  // 触发离开动画
  visible.value = false;

  // 动画结束后通知父组件移除
  setTimeout(() => {
    emit('close');
  }, 300);
};

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style lang="scss" scoped>
// 基础样式
.message-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 16px;
  background-color: #edf2fc;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 9999;
  max-width: 380px;
  width: calc(100% - 32px);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: auto;

  // 进入动画
  &.message-fade-in {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  // 离开动画
  &.message-fade-out {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
}

// 图标样式
.message-icon {
  margin-right: 8px;
  color: #409eff; // 默认信息蓝色

  .icon-info {
    display: inline-block;
    width: 16px;
    height: 16px;
    //background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='16' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
  }
}

// 内容样式
.message-content {
  flex: 1;
  color: #909399;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

// 关闭按钮样式
.message-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #c0c4cc;
  padding: 0 4px;
  margin-left: 8px;
  font-size: 16px;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #909399;
  }

  .icon-close {
    display: inline-block;
    width: 16px;
    height: 16px;
    //background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
  }
}
</style>
