/**
 * 项目存储 — localStorage 持久化（带 RLE 压缩）
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

// ---- RLE 压缩 ----
// 将 ["P01","P01","P01","P02",null] 压缩为 "P01:3|P02:1|_:1"
// 大面积同色的拼豆图案压缩率可达 80%+

function compressGridData(gridData) {
  if (!gridData || gridData.length === 0) return '';
  const parts = [];
  let prev = gridData[0];
  let count = 1;
  for (let i = 1; i < gridData.length; i++) {
    if (gridData[i] === prev) {
      count++;
    } else {
      parts.push(`${prev === null ? '_' : prev}:${count}`);
      prev = gridData[i];
      count = 1;
    }
  }
  parts.push(`${prev === null ? '_' : prev}:${count}`);
  return parts.join('|');
}

function decompressGridData(str, length) {
  if (!str) return new Array(length).fill(null);
  const result = [];
  const parts = str.split('|');
  for (const part of parts) {
    const colonIdx = part.lastIndexOf(':');
    const val = part.substring(0, colonIdx);
    const count = parseInt(part.substring(colonIdx + 1), 10);
    const color = val === '_' ? null : val;
    for (let i = 0; i < count; i++) result.push(color);
  }
  return result;
}

// 保存时压缩 gridData，加载时自动解压（兼容旧格式）
function compressProject(project) {
  return { ...project, gridData: compressGridData(project.gridData), _compressed: true };
}

function decompressProject(project) {
  if (project._compressed && typeof project.gridData === 'string') {
    const len = project.width * project.height;
    return { ...project, gridData: decompressGridData(project.gridData, len), _compressed: undefined };
  }
  return project; // 旧格式，直接返回
}

export function loadProjects() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return raw.map(decompressProject);
  } catch { return []; }
}

export function saveProject(project) {
  // 先加载并解压所有项目
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  // 保存时全部压缩
  const compressed = projects.map(compressProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compressed));
  return project;
}

export function deleteProject(id) {
  const projects = loadProjects().filter((p) => p.id !== id);
  const compressed = projects.map(compressProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compressed));
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
