/**
 * 全局状态管理 — 不可变状态 + 批处理撤销
 */

import { loadSettings, loadUserPalette } from '../data/user-palette.js';

let state = {
  // 当前 Tab
  currentTab: 'home', // home | favorites | custom | settings

  // 编辑器状态
  editor: {
    active: false,
    mode: 'blank',        // blank | image
    projectId: null,
    width: 37,
    height: 37,
    gridData: [],          // string[] 色号数组
    currentColor: null,    // 当前选中的色号
    cellSize: 20,
    showLabels: true,
    showGrid: true,
  },

  // 图片生成临时数据
  imageUpload: {
    sourceImage: null,
    cells: [],             // 匹配后的网格数据
    layers: [],
  },

  // 用户颜色池
  userPalette: new Set(),
  brand: 'perler',

  // 撤销/重做
  undoStack: [],
  redoStack: [],
};

// 事务批处理（内部可变）
let batchDepth = 0;
let batchEntries = [];

const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/** 通知所有 listener（带错误处理） */
function notify() {
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error('[state listener]', e); }
  }
}

/**
 * 合并顶层状态 — 返回新引用（浅拷贝）
 */
export function setState(updates) {
  state = { ...state, ...updates };
  notify();
}

/**
 * 合并 editor 子对象 — 返回新引用
 */
export function setEditorState(updates) {
  state = { ...state, editor: { ...state.editor, ...updates } };
  notify();
}

export function getState() { return state; }

/**
 * 初始化（从 localStorage 恢复）
 */
export function initState() {
  const settings = loadSettings();
  const palette = loadUserPalette(settings.brand);
  setState({
    brand: settings.brand,
    userPalette: palette,
    editor: {
      ...state.editor,
      showLabels: settings.showLabels,
      showGrid: settings.showGrid,
    },
  });
}

// ---- 事务批处理 ----

/**
 * 开始事务批处理 — pointerdown 时调用
 * 批处理期间所有 setCellColor 合并为一个 undo 条目
 */
export function beginBatch() {
  batchDepth++;
}

/**
 * 结束事务批处理 — pointerup 时调用
 * 将批处理期间的操作合并推入 undoStack
 */
export function endBatch() {
  batchDepth = Math.max(0, batchDepth - 1);
  if (batchDepth === 0 && batchEntries.length > 0) {
    const newUndo = [...state.undoStack, batchEntries];
    if (newUndo.length > 500) newUndo.shift();
    setState({ undoStack: newUndo, redoStack: [] });
    batchEntries = [];
  }
}

// ---- 格子编辑 ----

/**
 * 编辑器：设置格子颜色（带撤销支持）
 */
export function setCellColor(index, colorId) {
  const { editor } = state;
  if (index < 0 || index >= editor.gridData.length) return;
  const oldColor = editor.gridData[index];
  if (oldColor === colorId) return;

  // 记录撤销条目
  const entry = { index, oldColor, newColor: colorId };

  if (batchDepth > 0) {
    // 批处理中：收集到 batch 数组
    batchEntries.push(entry);
  } else {
    // 非批处理：直接推入 undoStack
    const newUndo = [...state.undoStack, entry];
    if (newUndo.length > 500) newUndo.shift();
    setState({ undoStack: newUndo, redoStack: [] });
  }

  // 更新 gridData（创建新数组）
  const newGrid = [...editor.gridData];
  newGrid[index] = colorId;
  setEditorState({ gridData: newGrid });
}

/**
 * 撤销（支持单条目和批量条目）
 */
export function undo() {
  const { undoStack, editor } = state;
  if (undoStack.length === 0) return;
  const top = undoStack[undoStack.length - 1];
  const entries = Array.isArray(top) ? top : [top];

  const newGrid = [...editor.gridData];
  for (let i = entries.length - 1; i >= 0; i--) {
    newGrid[entries[i].index] = entries[i].oldColor;
  }

  setState({
    undoStack: undoStack.slice(0, -1),
    redoStack: [...state.redoStack, top],
  });
  setEditorState({ gridData: newGrid });
}

/**
 * 重做（支持单条目和批量条目）
 */
export function redo() {
  const { redoStack, editor } = state;
  if (redoStack.length === 0) return;
  const top = redoStack[redoStack.length - 1];
  const entries = Array.isArray(top) ? top : [top];

  const newGrid = [...editor.gridData];
  for (const entry of entries) {
    newGrid[entry.index] = entry.newColor;
  }

  setState({
    redoStack: redoStack.slice(0, -1),
    undoStack: [...state.undoStack, top],
  });
  setEditorState({ gridData: newGrid });
}

// ---- 画布操作 ----

/**
 * 创建空白画布
 */
export function createBlankCanvas(width, height) {
  const gridData = new Array(width * height).fill(null);
  setState({
    editor: {
      ...state.editor,
      active: true,
      mode: 'blank',
      projectId: null,
      width,
      height,
      gridData,
      currentColor: state.editor.currentColor || 'P01',
    },
    undoStack: [],
    redoStack: [],
  });
}

/**
 * 加载项目到编辑器
 */
export function loadProjectToEditor(project) {
  setState({
    editor: {
      ...state.editor,
      active: true,
      mode: project.source || 'blank',
      projectId: project.id,
      width: project.width,
      height: project.height,
      gridData: [...project.gridData],
    },
    undoStack: [],
    redoStack: [],
  });
}
