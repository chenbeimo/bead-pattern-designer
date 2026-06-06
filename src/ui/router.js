/**
 * 页面路由：Tab 导航 + 页面切换
 */

const pages = {
  pageHome: document.getElementById('pageHome'),
  pageEdit: document.getElementById('pageEdit'),
  pageFavorites: document.getElementById('pageFavorites'),
  pageProfile: document.getElementById('pageProfile'),
};

let currentPage = 'pageHome';

/**
 * 初始化路由
 */
export function initRouter() {
  const tabItems = document.querySelectorAll('.tab-item');
  const btnBack = document.getElementById('btnBack');
  const actionUpload = document.getElementById('actionUpload');
  const actionCreate = document.getElementById('actionCreate');
  const fabUpload = document.getElementById('fabUpload');

  // Tab 切换
  tabItems.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.page;
      if (target) navigateTo(target);
    });
  });

  // 返回按钮
  btnBack.addEventListener('click', () => navigateTo('pageHome'));

  // 首页操作卡片
  actionUpload.addEventListener('click', () => {
    navigateTo('pageEdit');
    // 触发文件选择
    setTimeout(() => document.getElementById('fileInput').click(), 200);
  });

  actionCreate.addEventListener('click', () => {
    navigateTo('pageEdit');
  });

  // FAB 按钮
  fabUpload.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
}

/**
 * 导航到指定页面
 */
export function navigateTo(pageId) {
  if (!pages[pageId]) return;
  currentPage = pageId;

  // 切换页面可见性
  Object.values(pages).forEach((p) => p.classList.remove('active'));
  pages[pageId].classList.add('active');

  // 更新 Tab 高亮
  document.querySelectorAll('.tab-item').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.page === pageId);
  });

  // FAB 按钮：只在编辑页显示
  const fab = document.getElementById('fabUpload');
  fab.classList.toggle('visible', pageId === 'pageEdit');
}

/**
 * 获取当前页面
 */
export function getCurrentPage() {
  return currentPage;
}
