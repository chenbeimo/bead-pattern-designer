/**
 * 画布设置弹窗
 */
import { createBlankCanvas, getState, setEditorState } from '../core/app-state.js';
import { openEditor } from './editor.js';

export function initModal() {
  const modal = document.getElementById('canvasSizeModal');
  const widthSlider = document.getElementById('modalWidth');
  const heightSlider = document.getElementById('modalHeight');
  const widthVal = document.getElementById('modalWidthVal');
  const heightVal = document.getElementById('modalHeightVal');
  const totalEl = document.getElementById('modalTotal');

  function updateTotal() {
    const w = parseInt(widthSlider.value);
    const h = parseInt(heightSlider.value);
    widthVal.textContent = w;
    heightVal.textContent = h;
    totalEl.textContent = `共 ${w * h} 颗豆子`;
  }

  widthSlider.addEventListener('input', updateTotal);
  heightSlider.addEventListener('input', updateTotal);

  // 取消
  document.getElementById('modalCancel').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // 点击遮罩关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // 确认
  document.getElementById('modalConfirm').addEventListener('click', () => {
    const w = parseInt(widthSlider.value);
    const h = parseInt(heightSlider.value);
    modal.classList.add('hidden');
    createBlankCanvas(w, h);
    openEditor();
  });

  // 自制页 FAB
  document.getElementById('fabNewProject').addEventListener('click', () => {
    updateTotal();
    modal.classList.remove('hidden');
  });
}
