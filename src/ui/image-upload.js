/**
 * 图片上传 → 网格化 → 进入编辑器
 */
import { getState, setState, setEditorState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';
import { mapPixelsToBeads } from '../utils/color-matcher.js';
import { getAvailableColors } from '../data/user-palette.js';
import { openEditor } from './editor.js';
import { showToast } from './toast.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function initImageUpload() {
  const fileInput = document.getElementById('fileInput');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    fileInput.value = '';
  });

  // 首页拖拽
  const homePage = document.getElementById('pageHome');
  homePage.addEventListener('dragover', (e) => { e.preventDefault(); });
  homePage.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件');
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    showToast(`图片 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过 5MB 限制`);
    return;
  }

  try {
    const img = await loadImage(file);
    const state = getState();
    const settings = JSON.parse(localStorage.getItem('bead-settings') || '{}');
    const targetWidth = settings.defaultWidth || 50;
    const aspect = img.naturalHeight / img.naturalWidth;
    const gridWidth = Math.max(10, Math.min(200, targetWidth));
    const gridHeight = Math.max(10, Math.round(gridWidth * aspect));

    // 缩放到网格尺寸
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gridWidth;
    offCanvas.height = gridHeight;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
    const imageData = offCtx.getImageData(0, 0, gridWidth, gridHeight);

    // 颜色匹配（使用用户颜色池）
    const availableColors = getAvailableColors(state.brand);
    if (availableColors.length === 0) {
      showToast('没有可用颜色，请先在颜色选择器中勾选');
      return;
    }

    const cells = mapPixelsToBeads(imageData.data, gridWidth, gridHeight, availableColors);
    const gridData = cells.map((c) => c.beadId);

    // 设置编辑器状态
    setState({
      editor: {
        ...state.editor,
        active: true,
        mode: 'image',
        projectId: null,
        width: gridWidth,
        height: gridHeight,
        gridData,
        currentColor: state.editor.currentColor || availableColors[0].id,
      },
      undoStack: [],
      redoStack: [],
    });

    openEditor();
    showToast(`已生成 ${gridWidth}×${gridHeight} 图纸`);
  } catch (err) {
    console.error(err);
    showToast('图片处理失败，请重试');
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
