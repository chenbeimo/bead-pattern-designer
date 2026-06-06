/**
 * 像素编辑器 — 点击填色 / 缩放 / 撤销重做
 */
import { getState, setCellColor, undo, redo, setEditorState, setState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';
import { showFullPage, goBack } from './router.js';
import { saveProject, genId, loadProjects, isFavorite, toggleFavorite } from '../data/projects.js';
import { showToast } from './toast.js';

let canvas, ctx;
let isDrawing = false;
let lastCellIdx = -1;

export function initEditor() {
  canvas = document.getElementById('editorCanvas');
  ctx = canvas.getContext('2d');

  // 返回
  document.getElementById('editorBack').addEventListener('click', () => {
    goBack();
  });

  // 撤销/重做
  document.getElementById('editorUndo').addEventListener('click', () => { undo(); renderEditor(); });
  document.getElementById('editorRedo').addEventListener('click', () => { redo(); renderEditor(); });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (getState().currentTab !== 'editor' && !document.getElementById('pageEditor').classList.contains('active')) return;
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); renderEditor(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); renderEditor(); }
  });

  // 显示选项
  document.getElementById('editorShowLabels').addEventListener('change', (e) => {
    setEditorState({ showLabels: e.target.checked });
    renderEditor();
  });
  document.getElementById('editorShowGrid').addEventListener('change', (e) => {
    setEditorState({ showGrid: e.target.checked });
    renderEditor();
  });

  // 选色按钮
  document.getElementById('btnPickColor').addEventListener('click', () => {
    showFullPage('pageColorPicker');
  });

  // 顶部颜色显示也可点击进入选色
  document.getElementById('editorColorDisplay').addEventListener('click', () => {
    showFullPage('pageColorPicker');
  });

  // 保存
  document.getElementById('btnSaveProject').addEventListener('click', saveCurrentProject);

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

  // 设置当前颜色默认值
  if (!editor.currentColor) {
    const palette = getPalette(state.brand);
    setEditorState({ currentColor: palette[0].id });
  }

  showFullPage('pageEditor');
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

  const { width, height, gridData, cellSize, showLabels, showGrid, currentColor } = editor;
  const cw = width * cellSize;
  const ch = height * cellSize;

  canvas.width = cw;
  canvas.height = ch;

  // 背景
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
        // 空格子：棋盘格提示
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

  // 5格加粗线
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

  // 当前颜色高亮光标（如果正在绘制）
  if (currentColor && cellSize >= 10) {
    // 在顶部显示当前颜色
    updateEditorHeader();
  }
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
  const rect = canvas.getBoundingClientRect();
  const state = getState();
  const { editor } = state;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((e.clientX - rect.left) * scaleX) / editor.cellSize);
  const y = Math.floor(((e.clientY - rect.top) * scaleY) / editor.cellSize);
  if (x < 0 || x >= editor.width || y < 0 || y >= editor.height) return -1;
  return y * editor.width + x;
}

function onPointerDown(e) {
  e.preventDefault();
  isDrawing = true;
  const idx = getCellFromEvent(e);
  if (idx >= 0) {
    const state = getState();
    setCellColor(idx, state.editor.currentColor);
    lastCellIdx = idx;
    renderEditor();
  }
}

function onPointerMove(e) {
  if (!isDrawing) return;
  const idx = getCellFromEvent(e);
  if (idx >= 0 && idx !== lastCellIdx) {
    const state = getState();
    setCellColor(idx, state.editor.currentColor);
    lastCellIdx = idx;
    renderEditor();
  }
}

function onPointerUp() {
  isDrawing = false;
  lastCellIdx = -1;
}

function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  onPointerDown(touch);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  onPointerMove(touch);
}

/**
 * 保存当前项目
 */
function saveCurrentProject() {
  const state = getState();
  const { editor } = state;

  // 生成缩略图
  const thumbCanvas = document.createElement('canvas');
  const thumbSize = 128;
  thumbCanvas.width = thumbSize;
  thumbCanvas.height = thumbSize;
  const tCtx = thumbCanvas.getContext('2d');
  tCtx.drawImage(canvas, 0, 0, thumbSize, thumbSize);
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
