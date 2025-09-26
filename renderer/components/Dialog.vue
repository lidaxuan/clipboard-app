<template>
  <div v-if="visible" class="dialog-mask">
    <div class="dialog-box">
      <h3 class="dialog-title">{{ options.title }}</h3>

      <div class="dialog-content">
        <!-- 普通消息 -->
        <p v-if="!options.showInput">{{ options.message }}</p>

        <!-- 输入框 -->
        <input
            v-if="options.showInput"
            v-model="inputValue"
            type="text"
            class="dialog-input"
        />
      </div>

      <div class="dialog-actions">
        <button @click="handleCancel">取消</button>
        <button class="confirm" @click="handleConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"

const visible = ref(false)
const inputValue = ref("")
const options = reactive({
  title: "提示",
  message: "",
  showInput: false,
  defaultValue: "",
  onConfirm: null,
  onCancel: null,
})

// 外部调用方法
function open(opts = {}) {
  options.title = opts.title || "提示"
  options.message = opts.message || ""
  options.showInput = !!opts.showInput
  options.defaultValue = opts.defaultValue || ""
  inputValue.value = options.defaultValue
  options.onConfirm = opts.onConfirm || null
  options.onCancel = opts.onCancel || null

  visible.value = true
}

function handleCancel() {
  visible.value = false
  options.onCancel && options.onCancel()
}

function handleConfirm() {
  visible.value = false
  if (options.showInput) {
    options.onConfirm && options.onConfirm(inputValue.value)
  } else {
    options.onConfirm && options.onConfirm()
  }
}

defineExpose({ open }) // 外部能直接调用 open()
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.dialog-box {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
  margin-top: 200px;
}

.dialog-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: bold;
}

.dialog-content {
  margin-bottom: 15px;

  .dialog-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #eee;
    color: #000;
    &.confirm {
      background: #409eff;
      color: #fff;
    }
  }
}
</style>
