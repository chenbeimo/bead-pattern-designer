/**
 * 路由：Tab 导航 + 页面切换
 */
import { getState, setState } from '../core/app-state.js';

const TAB_PAGES = { home: 'pageHome', favorites: 'pageFavorites', custom: 'pageCustom', settings: 'pageSettings' };
const FULL_PAGES = ['pageEditor', 'pageColorPicker'];

let previousTab = 'home';

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

  // Tab 栏可见
  document.querySelector('.tab-bar').classList.remove('hidden');
}

export function showFullPage(pageId) {
  // 隐藏所有 Tab 页
  Object.values(TAB_PAGES).forEach((id) => document.getElementById(id).classList.remove('active'));
  FULL_PAGES.forEach((id) => document.getElementById(id).classList.remove('active'));

  document.getElementById(pageId).classList.add('active');
  // Tab 栏保留但不高亮任何项
  document.querySelectorAll('.tab-item').forEach((t) => t.classList.remove('active'));
}

export function goBack() {
  switchTab(previousTab || 'home');
}

export function getPreviousTab() { return previousTab; }
