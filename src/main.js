/**
 * 拼豆图纸生成器 — 入口
 */

import { initToolbar } from './ui/toolbar.js';
import { initLayerPanel } from './ui/layer-panel.js';
import { initRouter } from './ui/router.js';

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initToolbar();
  initLayerPanel();
});
