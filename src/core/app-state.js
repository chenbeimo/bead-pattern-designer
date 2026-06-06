/**
 * 全局状态管理 — 重构版
 */

import { loadSettings, saveSettings, loadUserPalette, saveUserPalette } from '../data/user-palette.js';

const state = {
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

const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function setState(updates) {
  Object.assign(state, updates);
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error(e); }
  }
}

export function setEditorState(updates) {
  Object.assign(state.editor, updates);
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error(e); }
  }
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

/**
 * 编辑器：设置格子颜色（带撤销支持）
 */
export function setCellColor(index, colorId) {
  const { editor } = state;
  if (index < 0 || index >= editor.gridData.length) return;
  const oldColor = editor.gridData[index];
  if (oldColor === colorId) return;

  // 记录撤销
  state.undoStack.push({ index, oldColor, newColor: colorId });
  if (state.undoStack.length > 500) state.undoStack.shift();
  state.redoStack = [];

  editor.gridData[index] = colorId;
  // 触发更新
  setEditorState({ gridData: editor.gridData });
}

/**
 * 撤销
 */
export function undo() {
  const entry = state.undoStack.pop();
  if (!entry) return;
  state.editor.gridData[entry.index] = entry.oldColor;
  state.redoStack.push(entry);
  setEditorState({ gridData: state.editor.gridData });
}

/**
 * 重做
 */
export function redo() {
  const entry = state.redoStack.pop();
  if (!entry) return;
  state.editor.gridData[entry.index] = entry.newColor;
  state.undoStack.push(entry);
  setEditorState({ gridData: state.editor.gridData });
}

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
