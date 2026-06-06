/**
 * 像素编辑器 — 点击填色 / 缩放 / 撤销重做
 */
import { getState, setCellColor, undo, redo, setEditorState, setState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';
import { showFullPage, goBack, setBarMode } from './router.js';
import { saveProject, genId } from '../data/projects.js';
import { showToast } from './toast.js';
import { exportPng, exportPdf } from './exporter.js';

let canvas, ctx;
let isDrawing = false;
let lastCellIdx = -1;

export function initEditor() {
  canvas = document.getElementById('editorCanvas');
  ctx = canvas.getContext('2d');

  // 返回（顶部 header）
  document.getElementById('editorBack').addEventListener('click', () => {
    goBack();
  });

  // 底部栏按钮
  document.getElementById('editorUndo').addEventListener('click', () => { undo(); renderEditor(); });
  document.getElementById('btnExportPng').addEventListener('click', () => exportPng());
  document.getElementById('btnPickColor').addEventListener('click', () => {
    showFullPage('pageColorPicker');
  });
  document.getElementById('btnSaveProject').addEventListener('click', saveCurrentProject);

  // 完成按钮 → 保存并返回
  document.getElementById('editorDone').addEventListener('click', () => {
    saveCurrentProject();
    goBack();
  });

  // 顶部颜色显示也可点击进入选色
  document.getElementById('editorColorDisplay').addEventListener('click', () => {
    showFullPage('pageColorPicker');
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('pageEditor').classList.contains('active')) return;
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); renderEditor(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); renderEditor(); }
  });

  // Canvas 绘图事件
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp);

  // 滚轮缩放
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const state = getState();
    const delta = e.deltaY > 0 ? -2 : 2;
    const newSize = Math.max(5, Math.min(60, state.editor.cellSize + delta));
    setEditorState({ cellSize: newSize });
    renderEditor();
  }, { passive: false });
}

/**
 * 打开编辑器
 */
export function openEditor() {
  const state = getState();
  const { editor } = state;

  if (!editor.currentColor) {
    const palette = getPalette(state.brand);
    setEditorState({ currentColor: palette[0].id });
  }

  showFullPage('pageEditor');
  // 刷新 canvas 引用（页面切换后 DOM 可能变化）
  canvas = document.getElementById('editorCanvas');
  ctx = canvas ? canvas.getContext('2d') : null;
  updateEditorHeader();
  renderEditor();
}

/**
 * 渲染编辑器画布
 */
export function renderEditor() {
  const state = getState();
  const { editor } = state;
  if (!editor.active) return;

  // 确保 canvas 引用有效
  if (!canvas) canvas = document.getElementById('editorCanvas');
  if (!canvas) return;
  if (!ctx) ctx = canvas.getContext('2d');

  const { width, height, gridData, cellSize, showLabels, showGrid } = editor;
  const cw = width * cellSize;
  const ch = height * cellSize;

  canvas.width = cw;
  canvas.height = ch;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);

  const palette = getPalette(state.brand);
  const colorMap = new Map(palette.map((c) => [c.id, c]));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const colorId = gridData[idx];
      const px = x * cellSize;
      const py = y * cellSize;

      if (colorId && colorMap.has(colorId)) {
        const c = colorMap.get(colorId);
        ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
        ctx.fillRect(px, py, cellSize, cellSize);

        if (showLabels && cellSize >= 14) {
          const brightness = (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
          ctx.fillStyle = brightness > 128 ? '#000' : '#fff';
          ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.35))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(c.id, px + cellSize / 2, py + cellSize / 2);
        }
      } else {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#f8f8f8' : '#f0f0f0';
        ctx.fillRect(px, py, cellSize, cellSize);
      }

      if (showGrid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }
  }

  if (showGrid && cellSize >= 6) {
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 5) {
      ctx.beginPath(); ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, ch); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 5) {
      ctx.beginPath(); ctx.moveTo(0, y * cellSize); ctx.lineTo(cw, y * cellSize); ctx.stroke();
    }
  }

  updateEditorHeader();
}

function updateEditorHeader() {
  const state = getState();
  const { editor } = state;
  const palette = getPalette(state.brand);
  const color = palette.find((c) => c.id === editor.currentColor);
  if (color) {
    document.getElementById('editorColorDot').style.background = `rgb(${color.r},${color.g},${color.b})`;
    document.getElementById('editorColorName').textContent = `${color.id} ${color.name}`;
  }
}

function getCellFromEvent(e) {
  const editor = getState().editor;
  const { width, height, cellSize } = editor;
  if (!canvas || canvas.width === 0 || canvas.height === 0) return -1;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return -1;

  // 支持 touch 和 mouse 事件
  const clientX = e.clientX ?? e.pageX;
  const clientY = e.clientY ?? e.pageY;
  if (clientX == null || clientY == null) return -1;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((clientX - rect.left) * scaleX) / cellSize);
  const y = Math.floor(((clientY - rect.top) * scaleY) / cellSize);

  if (x < 0 || x >= width || y < 0 || y >= height) return -1;
  return y * width + x;
}

function paintCell(idx) {
  if (idx < 0) return;
  const { editor } = getState();
  if (!editor.currentColor) return;
  setCellColor(idx, editor.currentColor);
  renderEditor();
}

function onPointerDown(e) {
  e.preventDefault();
  isDrawing = true;
  lastCellIdx = getCellFromEvent(e);
  paintCell(lastCellIdx);
}

function onPointerMove(e) {
  if (!isDrawing) return;
  const idx = getCellFromEvent(e);
  if (idx >= 0 && idx !== lastCellIdx) {
    lastCellIdx = idx;
    paintCell(idx);
  }
}

function onPointerUp() {
  isDrawing = false;
  lastCellIdx = -1;
}

function onTouchStart(e) {
  e.preventDefault();
  onPointerDown(e.touches[0]);
}

function onTouchMove(e) {
  e.preventDefault();
  onPointerMove(e.touches[0]);
}

function saveCurrentProject() {
  const state = getState();
  const { editor } = state;

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 128;
  thumbCanvas.height = 128;
  const tCtx = thumbCanvas.getContext('2d');
  tCtx.drawImage(canvas, 0, 0, 128, 128);
  const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.6);

  const project = {
    id: editor.projectId || genId(),
    name: editor.mode === 'image' ? '图片生成' : '自制图纸',
    width: editor.width,
    height: editor.height,
    gridData: [...editor.gridData],
    thumbnail,
    createdAt: new Date().toISOString(),
    source: editor.mode,
  };

  saveProject(project);
  setEditorState({ projectId: project.id });
  showToast('已保存！');
}
