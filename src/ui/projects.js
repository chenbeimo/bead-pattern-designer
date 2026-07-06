/**
 * 项目列表 — 最近作品 / 收藏 / 自制
 */
import { loadProjects, deleteProject, toggleFavorite, isFavorite, loadFavorites } from '../data/projects.js';
import { loadProjectToEditor, subscribe } from '../core/app-state.js';
import { openEditor } from './editor.js';

export function initProjects() {
  // 订阅状态刷新列表
  subscribe(() => {
    renderRecentList();
    renderCustomList();
    renderFavoritesList();
  });

  // 初始渲染
  renderRecentList();
  renderCustomList();
  renderFavoritesList();
}

/**
 * 首页最近作品
 */
function renderRecentList() {
  const container = document.getElementById('recentList');
  const projects = loadProjects().slice(0, 10);

  if (projects.length === 0) {
    container.innerHTML = '<div style="font-size:13px;color:var(--text-hint);padding:16px 0;">暂无作品，快去创作吧！</div>';
    return;
  }

  container.innerHTML = '';
  projects.forEach((p) => {
    const mini = document.createElement('div');
    mini.className = 'recent-mini';
    mini.innerHTML = `
      <div class="recent-mini__thumb">${p.thumbnail ? `<img src="${p.thumbnail}" alt="" />` : '🎨'}</div>
      <div class="recent-mini__info"><span class="recent-mini__size">${p.width}×${p.height}</span></div>
    `;
    mini.addEventListener('click', () => openProject(p));
    container.appendChild(mini);
  });
}

/**
 * 自制页列表
 */
function renderCustomList() {
  const container = document.getElementById('customList');
  const empty = document.getElementById('customEmpty');
  const projects = loadProjects();

  if (projects.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = '';
  projects.forEach((p) => {
    container.appendChild(createProjectCard(p));
  });
}

/**
 * 收藏页列表
 */
function renderFavoritesList() {
  const container = document.getElementById('favoritesList');
  const empty = document.getElementById('favoritesEmpty');
  const favIds = loadFavorites();
  const allProjects = loadProjects();
  const favProjects = allProjects.filter((p) => favIds.includes(p.id));

  if (favProjects.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = '';
  favProjects.forEach((p) => {
    container.appendChild(createProjectCard(p));
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  const fav = isFavorite(project.id);
  const date = new Date(project.createdAt);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  card.innerHTML = `
    <div class="project-card__thumb">${project.thumbnail ? `<img src="${project.thumbnail}" alt="" />` : '🎨'}</div>
    <div class="project-card__info">
      <div class="project-card__name">${project.name}</div>
      <div class="project-card__meta">${project.width}×${project.height} · ${dateStr}</div>
    </div>
    <div class="project-card__actions">
      <button type="button" class="project-card__btn project-card__btn--fav ${fav ? 'active' : ''}" data-id="${project.id}" title="收藏">❤️</button>
      <button type="button" class="project-card__btn project-card__btn--del" data-id="${project.id}" title="删除">🗑️</button>
    </div>
  `;

  // 点击打开
  card.addEventListener('click', (e) => {
    if (e.target.closest('.project-card__btn')) return;
    openProject(project);
  });

  // 收藏
  card.querySelector('.project-card__btn--fav').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(project.id);
    renderRecentList();
    renderCustomList();
    renderFavoritesList();
  });

  // 删除
  card.querySelector('.project-card__btn--del').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('确定删除这个作品？')) {
      deleteProject(project.id);
      renderRecentList();
      renderCustomList();
      renderFavoritesList();
    }
  });

  return card;
}

function openProject(project) {
  loadProjectToEditor(project);
  openEditor();
}
