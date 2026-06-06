/**
 * 工具栏与设置面板 UI
 */

import { getState, setState } from '../core/app-state.js';
import { loadImageFromFile, processImage } from '../core/grid-processor.js';
import { renderGrid } from '../core/grid-renderer.js';
import { exportPng, exportPdf } from './exporter.js';
import { navigateTo } from './router.js';

/**
 * 初始化所有 UI 事件
 */
export function initToolbar() {
  const fileInput = document.getElementById('fileInput');
  const brandSelect = document.getElementById('brandSelect');
  const gridWidthSlider = document.getElementById('gridWidthSlider');
  const gridWidthVal = document.getElementById('gridWidthVal');
  const gridInfoLeft = document.getElementById('gridInfoLeft');
  const gridInfoRight = document.getElementById('gridInfoRight');
  const canvasInfo = document.getElementById('canvasInfo');
  const showLabelsCheckbox = document.getElementById('showLabels');
  const showGridCheckbox = document.getElementById('showGrid');
  const zoomSlider = document.getElementById('zoomSlider');
  const cellSizeLabel = document.getElementById('cellSizeLabel');
  const exportPngBtn = document.getElementById('exportPng');
  const exportPdfBtn = document.getElementById('exportPdf');
  const canvas = document.getElementById('mainCanvas');
  const placeholder = document.getElementById('canvasPlaceholder');
  const canvasCard = document.getElementById('canvasCard');

  // 文件上传
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // 拖拽上传（整个编辑页面）
  const editPage = document.getElementById('pageEdit');
  editPage.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvasCard.classList.add('drag-over');
  });
  editPage.addEventListener('dragleave', (e) => {
    if (!editPage.contains(e.relatedTarget)) {
      canvasCard.classList.remove('drag-over');
    }
  });
  editPage.addEventListener('drop', (e) => {
    e.preventDefault();
    canvasCard.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // 品牌切换
  brandSelect.addEventListener('change', (e) => {
    const state = getState();
    if (state.sourceImage) {
      processImage(state.sourceImage, state.gridWidth, e.target.value);
      renderGrid(canvas);
      updateExportButtons(true);
    }
  });

  // 网格宽度滑块
  let debounceTimer = null;
  gridWidthSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    gridWidthVal.textContent = val;
    scheduleReprocess(val);
  });

  function scheduleReprocess(val) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = getState();
      if (state.sourceImage) {
        processImage(state.sourceImage, val, state.brand);
        renderGrid(canvas);
        updateGridInfo();
      }
    }, 200);
  }

  // 显示选项
  showLabelsCheckbox.addEventListener('change', (e) => {
    setState({ showLabels: e.target.checked });
    renderGrid(canvas);
  });
  showGridCheckbox.addEventListener('change', (e) => {
    setState({ showGrid: e.target.checked });
    renderGrid(canvas);
  });

  // 缩放
  zoomSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    cellSizeLabel.textContent = size;
    setState({ cellSize: size });
    renderGrid(canvas);
  });

  // 导出
  exportPngBtn.addEventListener('click', () => exportPng());
  exportPdfBtn.addEventListener('click', () => exportPdf());

  // 恢复本地缓存
  const savedWidth = localStorage.getItem('bead-gridWidth');
  const savedBrand = localStorage.getItem('bead-brand');
  if (savedWidth) {
    const w = parseInt(savedWidth);
    gridWidthSlider.value = w;
    gridWidthVal.textContent = w;
  }
  if (savedBrand) {
    brandSelect.value = savedBrand;
  }

  // ---- 内部函数 ----

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function validateFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件（JPG、PNG、GIF 等）');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      showToast(`图片大小 ${sizeMB}MB 超过 5MB 限制，请压缩后重试`);
      return false;
    }
    return true;
  }

  function showToast(message) {
    const old = document.querySelector('.toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--show'));
    setTimeout(() => {
      toast.classList.remove('toast--show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  async function handleFile(file) {
    if (!validateFile(file)) {
      fileInput.value = '';
      return;
    }

    try {
      const img = await loadImageFromFile(file);
      const width = parseInt(gridWidthSlider.value) || 50;
      const brand = brandSelect.value;

      processImage(img, width, brand);
      renderGrid(canvas);

      placeholder.classList.add('hidden');
      canvasInfo.classList.remove('hidden');
      updateExportButtons(true);
      updateGridInfo();

      localStorage.setItem('bead-gridWidth', width);
      localStorage.setItem('bead-brand', brand);
      fileInput.value = '';

      // 自动跳转到编辑页
      navigateTo('pageEdit');
    } catch (err) {
      console.error('图片加载失败:', err);
      showToast('图片加载失败，请重试');
    }
  }

  function updateGridInfo() {
    const state = getState();
    if (state.isReady) {
      gridInfoLeft.textContent = `${state.gridWidth} × ${state.gridHeight} 格`;
      gridInfoRight.textContent = `共 ${state.gridWidth * state.gridHeight} 颗`;
    }
  }

  function updateExportButtons(enabled) {
    exportPngBtn.disabled = !enabled;
    exportPdfBtn.disabled = !enabled;
  }
}
