/**
 * 路由：Tab 导航 + 页面切换 + 底部栏模式切换
 */
import { getState, setState } from '../core/app-state.js';

const TAB_PAGES = { home: 'pageHome', favorites: 'pageFavorites', custom: 'pageCustom', settings: 'pageSettings' };
const FULL_PAGES = ['pageEditor', 'pageColorPicker'];

let previousTab = 'home';

const barTabs = document.getElementById('barTabs');
const barEditor = document.getElementById('barEditor');

export function initRouter() {
  const tabItems = document.querySelectorAll('.tab-item');

  tabItems.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      if (target) switchTab(target);
    });
  });

  // 首页入口卡片
  document.getElementById('actionUpload').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  document.getElementById('actionCreate').addEventListener('click', () => {
    switchTab('custom');
    setTimeout(() => document.getElementById('canvasSizeModal').classList.remove('hidden'), 150);
  });
}

export function switchTab(tabName) {
  if (!TAB_PAGES[tabName]) return;
  previousTab = getState().currentTab;
  setState({ currentTab: tabName });

  // 隐藏全屏页面
  FULL_PAGES.forEach((id) => document.getElementById(id).classList.remove('active'));

  // 切换 Tab 页面
  Object.values(TAB_PAGES).forEach((id) => document.getElementById(id).classList.remove('active'));
  document.getElementById(TAB_PAGES[tabName]).classList.add('active');

  // Tab 高亮
  document.querySelectorAll('.tab-item').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });

  // 切换到 Tab 模式
  setBarMode('tabs');
}

export function showFullPage(pageId) {
  Object.values(TAB_PAGES).forEach((id) => document.getElementById(id).classList.remove('active'));
  FULL_PAGES.forEach((id) => document.getElementById(id).classList.remove('active'));
  document.getElementById(pageId).classList.remove('no-tab-pad');

  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.tab-item').forEach((t) => t.classList.remove('active'));

  // 编辑器页用编辑器操作栏，颜色选择器保留 Tab 栏
  if (pageId === 'pageEditor') {
    setBarMode('editor');
  } else {
    setBarMode('tabs');
  }
}

export function goBack() {
  setBarMode('tabs');
  switchTab(previousTab || 'home');
}

/**
 * 切换底部栏模式
 * @param {'tabs'|'editor'} mode
 */
export function setBarMode(mode) {
  barTabs.classList.toggle('hidden', mode !== 'tabs');
  barEditor.classList.toggle('hidden', mode !== 'editor');
}

export function getPreviousTab() { return previousTab; }
