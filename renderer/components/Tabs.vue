<template>
  <div class="tab-container">
    <!-- 标签导航 -->
    <nav class="tabs">
      <!-- 滑动背景指示器 -->
      <div class="tab-indicator" :style="{width: indicatorWidth + 'px',transform: `translateX(${indicatorOffset}px)`,transition: indicatorTransition}"></div>

      <!-- 动态渲染标签按钮 -->
      <button v-for="(tab, index) in tabs" :key="tab.key" :class="{active: activeTab === tab.key}" @click="changeTab(tab)" :ref="el => tabRefs[index] = el">
        {{ tab.label }}
      </button>
    </nav>

    <!-- 标签内容区域 -->
    <div class="tab-content">
      <slot :activeTab="activeTab"/>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, provide, onUnmounted, defineEmits} from 'vue';

const emits = defineEmits(['change'])
// 定义组件Props
const props = defineProps({
  // 标签项配置 [{ key: 'xxx', label: 'xxx' }]
  tabs: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.length > 0 && value.every(item => item.key && item.label);
    }
  },
  // 默认激活的标签key
  defaultActive: {
    type: String,
    default: ''
  },
  // 激活背景颜色
  activeColor: {
    type: String,
    default: '#3498db'
  },
  // 激活文字颜色
  activeTextColor: {
    type: String,
    default: '#ffffff'
  },
  // 未激活文字颜色
  inactiveTextColor: {
    type: String,
    default: '#374151'
  },
  // 背景色
  backgroundColor: {
    type: String,
    default: '#e1dfdf'
  },
  // 动画时长(秒)
  animationDuration: {
    type: Number,
    default: 0.3
  }
});

// 激活的标签
const activeTab = ref(props.defaultActive || props.tabs[0].key);

// 标签元素引用数组
const tabRefs = ref([]);

// 指示器样式相关
const indicatorWidth = ref(0);
const indicatorOffset = ref(0);
const indicatorTransition = ref('none'); // 初始不启用过渡

// 计算指示器位置和宽度
const calculateIndicator = () => {
  // 找到当前激活标签的索引
  const activeIndex = props.tabs.findIndex(tab => tab.key === activeTab.value);
  const activeTabEl = tabRefs.value[activeIndex];

  if (activeTabEl) {
    const rect = activeTabEl.getBoundingClientRect();
    const parentRect = activeTabEl.parentElement.getBoundingClientRect();

    indicatorWidth.value = rect.width - 10;
    indicatorOffset.value = rect.left - parentRect.left;
  }
};

// 初始化
onMounted(() => {
  // 初始设置指示器位置
  calculateIndicator();
  // 初始化完成后启用过渡动画
  setTimeout(() => {
    indicatorTransition.value = `all ${props.animationDuration}s ease`;
  }, 0);

  // 监听窗口大小变化，重新计算指示器位置
  window.addEventListener('resize', calculateIndicator);
});

// 监听标签切换，更新指示器位置
watch(activeTab, calculateIndicator);

// 监听tabs变化，重新计算指示器位置
watch(() => props.tabs, calculateIndicator, {deep: true});

// 提供activeTab给插槽使用
provide('activeTab', activeTab);

const changeTab = (tab) =>{
  activeTab.value = tab.key;
  emits("change", tab);
}

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', calculateIndicator);
});
</script>

<style scoped lang="scss">
.tab-container {
  width: 100%;
  height: calc(100% - 97px);

  .tabs {
    position: relative;
    display: inline-flex;
    width: 100%;
    padding: 4px 5px;
    border-radius: 0 0 8px 8px;
    overflow: hidden;


    .tab-indicator {
      position: absolute;
      top: 4px;
      bottom: 4px;
      border-radius: 6px;
      z-index: 0;
    }

    button {
      padding: 10px 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      z-index: 1; /* 确保按钮在指示器上方 */
      transition: color 0.3s ease;
      flex: 1;
    }
  }

  .tab-content {
    width: 100%;
    height: calc(100% - 48px);
    overflow-y: auto;
  }

  /* 动态样式通过v-bind绑定 */
  :deep(.tabs) {
    background-color: v-bind(backgroundColor);
  }

  :deep(.tabs button) {
    color: v-bind(inactiveTextColor);
  }

  :deep(.tabs button.active) {
    color: v-bind(activeTextColor);
  }

  :deep(.tab-indicator) {
    background-color: v-bind(activeColor);
  }
}
</style>
