/**
 * 颜色选择器页 — 搜索/筛选/分类/勾选
 */
import { getState, setEditorState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';
import { loadUserPalette, saveUserPalette, isBaseColor, COLOR_GROUPS } from '../data/user-palette.js';
import { showFullPage, goBack } from './router.js';
import { renderEditor, openEditor } from './editor.js';

let currentGroup = 'all';
let searchQuery = '';

export function initColorPicker() {
  document.getElementById('colorPickerBack').addEventListener('click', () => {
    goBack();
    // 如果编辑器活跃，刷新
    const state = getState();
    if (state.editor.active) {
      setTimeout(() => { showFullPage('pageEditor'); renderEditor(); }, 0);
    }
  });

  document.getElementById('colorPickerDone').addEventListener('click', () => {
    goBack();
    const state = getState();
    if (state.editor.active) {
      setTimeout(() => { showFullPage('pageEditor'); renderEditor(); }, 0);
    }
  });

  // 搜索
  document.getElementById('colorSearch').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderColorGrid();
  });

  // 快捷按钮
  document.getElementById('colorSelectAll').addEventListener('click', () => {
    const state = getState();
    const palette = getFilteredColors();
    const ids = new Set(state.userPalette);
    palette.forEach((c) => ids.add(c.id));
    saveUserPalette(ids, state.brand);
    import('../core/app-state.js').then(({ setState }) => setState({ userPalette: ids }));
    renderColorGrid();
  });

  document.getElementById('colorClearAll').addEventListener('click', () => {
    const state = getState();
    const baseIds = new Set();
    getPalette(state.brand).forEach((c) => { if (isBaseColor(c.id)) baseIds.add(c.id); });
    saveUserPalette(baseIds, state.brand);
    import('../core/app-state.js').then(({ setState }) => setState({ userPalette: baseIds }));
    renderColorGrid();
  });

  document.getElementById('colorBaseOnly').addEventListener('click', () => {
    const state = getState();
    const baseIds = new Set();
    getPalette(state.brand).forEach((c) => { if (isBaseColor(c.id)) baseIds.add(c.id); });
    saveUserPalette(baseIds, state.brand);
    import('../core/app-state.js').then(({ setState }) => setState({ userPalette: baseIds }));
    renderColorGrid();
  });

  renderGroupTabs();
}

/**
 * 打开颜色选择器
 */
export function openColorPicker() {
  const state = getState();
  // 确保 userPalette 已加载
  if (state.userPalette.size === 0) {
    const palette = loadUserPalette(state.brand);
    import('../core/app-state.js').then(({ setState }) => setState({ userPalette: palette }));
  }
  currentGroup = 'all';
  searchQuery = '';
  document.getElementById('colorSearch').value = '';
  renderGroupTabs();
  renderColorGrid();
  showFullPage('pageColorPicker');
}

function renderGroupTabs() {
  const container = document.getElementById('colorGroupTabs');
  container.innerHTML = '';
  const state = getState();
  const palette = getPalette(state.brand);

  COLOR_GROUPS.forEach((group) => {
    const count = group.id === 'all' ? palette.length : palette.filter(group.match).length;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'colorpicker-tab' + (currentGroup === group.id ? ' active' : '');
    tab.textContent = `${group.label}(${count})`;
    tab.addEventListener('click', () => {
      currentGroup = group.id;
      document.querySelectorAll('.colorpicker-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderColorGrid();
    });
    container.appendChild(tab);
  });
}

function getFilteredColors() {
  const state = getState();
  const palette = getPalette(state.brand);
  let filtered = palette;

  // 分组筛选
  if (currentGroup !== 'all') {
    const group = COLOR_GROUPS.find((g) => g.id === currentGroup);
    if (group && group.match) filtered = filtered.filter(group.match);
  }

  // 搜索筛选
  if (searchQuery) {
    filtered = filtered.filter((c) =>
      c.id.toLowerCase().includes(searchQuery) ||
      c.name.toLowerCase().includes(searchQuery)
    );
  }

  return filtered;
}

function renderColorGrid() {
  const grid = document.getElementById('colorPickerGrid');
  const state = getState();
  const filtered = getFilteredColors();
  const selected = state.userPalette;

  grid.innerHTML = '';

  filtered.forEach((color) => {
    const isBase = isBaseColor(color.id);
    const isSelected = selected.has(color.id);

    const item = document.createElement('div');
    item.className = 'colorpick-item';
    if (isBase) item.classList.add('base');
    if (isSelected) item.classList.add('selected');

    item.innerHTML = `
      <div class="colorpick-item__swatch" style="background:rgb(${color.r},${color.g},${color.b})">
        ${isBase
          ? '<span class="colorpick-item__lock">🔒</span>'
          : `<span class="colorpick-item__check">✓</span>`
        }
      </div>
      <span class="colorpick-item__label">${color.id}</span>
    `;

    item.addEventListener('click', () => {
      if (isBase) return; // 基础色不可取消
      const ids = new Set(state.userPalette);
      if (ids.has(color.id)) ids.delete(color.id);
      else ids.add(color.id);
      saveUserPalette(ids, state.brand);
      import('../core/app-state.js').then(({ setState }) => setState({ userPalette: ids }));
      item.classList.toggle('selected');
    });

    grid.appendChild(item);
  });
}
