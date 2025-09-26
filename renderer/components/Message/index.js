import { createVNode, render } from 'vue';
import Message from './Message.vue';

// 存储所有消息实例
const instances = [];
// 消息之间的间距
const MARGIN = 16;
// 初始顶部偏移量
const INITIAL_TOP = 20;

// 计算新消息的顶部偏移量
const calculateTop = () => {
  if (instances.length === 0) {
    return INITIAL_TOP;
  }

  const lastInstance = instances[instances.length - 1];
  const lastRect = lastInstance.el.getBoundingClientRect();

  return lastRect.top + lastRect.height + MARGIN - document.documentElement.scrollTop;
};

// 更新所有消息的位置
const updatePositions = () => {
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];

    if (i === 0) {
      instance.component.props.topOffset = INITIAL_TOP;
    } else {
      const prevInstance = instances[i - 1];
      const prevRect = prevInstance.el.getBoundingClientRect();
      instance.component.props.topOffset = prevRect.height + MARGIN + prevInstance.component.props.topOffset;
    }
  }
};

// 移除消息实例
const removeInstance = (instance) => {
  const index = instances.findIndex(item => item.id === instance.id);
  if (index !== -1) {
    instances.splice(index, 1);
    render(null, instance.container);
    updatePositions();
  }
};

// 消息主函数
const message = (options) => {
  // 处理字符串参数的情况
  if (typeof options === 'string') {
    options = {
      message: options
    };
  }

  // 创建容器
  const container = document.createElement('div');

  // 生成唯一ID
  const id = `message-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // 创建虚拟节点
  const vnode = createVNode(Message, {
    ...options,
    onClose: () => {
      removeInstance(instance);
    }
  });

  // 设置容器
  vnode.el = container;

  // 渲染
  render(vnode, container);
  document.body.appendChild(container.firstElementChild);

  // 存储实例
  const instance = {
    id,
    el: container.firstElementChild,
    vnode,
    component: vnode.component,
    container
  };

  // 设置顶部偏移量
  instance.component.props.topOffset = calculateTop();

  instances.push(instance);

  return {
    close: () => {
      removeInstance(instance);
    }
  };
};

export default message;
