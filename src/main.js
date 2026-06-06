/**
 * 拼豆图纸生成器 — 入口
 */
import { initState } from './core/app-state.js';
import { initRouter } from './ui/router.js';
import { initEditor } from './ui/editor.js';
import { initColorPicker } from './ui/color-picker.js';
import { initModal } from './ui/modal.js';
import { initProjects } from './ui/projects.js';
import { initSettings } from './ui/settings.js';
import { initImageUpload } from './ui/image-upload.js';

document.addEventListener('DOMContentLoaded', () => {
  initState();
  initRouter();
  initEditor();
  initColorPicker();
  initModal();
  initProjects();
  initSettings();
  initImageUpload();
});
