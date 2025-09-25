<template>
  <div v-if="visible" class="modal-overlay" @click.self="cancel">
    <div class="modal-container">
      <h3 class="modal-title">{{ title }}</h3>
      <input
          v-model="inputValue"
          :placeholder="placeholder"
          class="modal-input"
          @keyup.enter="confirm"
      />
      <div class="modal-actions">
        <button class="confirm-btn" @click="confirm">确定</button>
        <button class="cancel-btn" @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue"

const props = defineProps({
  modelValue: String,     // 父组件绑定的输入值
  visible: Boolean,       // 显示状态
  title: { type: String, default: "请输入内容" },
  placeholder: { type: String, default: "" },
})

const emits = defineEmits(["update:modelValue", "confirm", "cancel"])

// 内部输入值
const inputValue = ref(props.modelValue || "")

// 同步外部 modelValue
watch(
    () => props.modelValue,
    (val) => {
      inputValue.value = val
    }
)

// 确认
function confirm() {
  emits("update:modelValue", inputValue.value)
  emits("confirm", inputValue.value)
}

// 取消
function cancel() {
  emits("cancel")
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  width: 320px;
  max-width: 90%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.modal-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}
.modal-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  margin-bottom: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.confirm-btn {
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}
.confirm-btn:hover {
  background-color: #36a373;
}
.cancel-btn {
  background: #eee;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}
.cancel-btn:hover {
  background: #ddd;
}
</style>
