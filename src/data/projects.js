/**
 * 项目存储 — localStorage 持久化
 */

const STORAGE_KEY = 'bead-projects';
const FAVORITES_KEY = 'bead-favorites';

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {number} width
 * @property {number} height
 * @property {string[]} gridData - 每个格子的色号，长度 = width * height
 * @property {string|null} thumbnail - DataURL
 * @property {string} createdAt - ISO 时间
 * @property {'blank'|'image'} source
 */

export function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

export function saveProject(project) {
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return project;
}

export function deleteProject(id) {
  const projects = loadProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  removeFavorite(id);
}

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch { return []; }
}

export function toggleFavorite(id) {
  const favs = loadFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return idx < 0; // true = now favorited
}

export function removeFavorite(id) {
  const favs = loadFavorites().filter((f) => f !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorite(id) {
  return loadFavorites().includes(id);
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
