/**
 * 拼豆图纸生成器 — 入口
 */

import { initToolbar } from './ui/toolbar.js';
import { initLayerPanel } from './ui/layer-panel.js';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initToolbar();
  initLayerPanel();
});
