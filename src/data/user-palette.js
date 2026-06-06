/**
 * 用户颜色池管理
 * 基础色始终选中不可取消，用户可额外勾选颜色
 */

import { getPalette } from './bead-palette.js';

const PALETTE_KEY = 'bead-user-palette';
const SETTINGS_KEY = 'bead-settings';

// 内置基础色 ID（所有品牌通用，不可取消）
const BASE_COLOR_IDS = [
  'P01', 'P02', 'P03', 'P05', 'P06', 'P08', 'P12', // Perler
  'H01', 'H02', 'H03', 'H05', 'H06', 'H08', 'H12', // Hama
  'A01', 'A02', 'A03', 'A06', 'A08', 'A11', 'A15', // Artkal
];

// 色系分类
export const COLOR_GROUPS = [
  { id: 'all',       label: '全部',    ids: null },
  { id: 'yellow',    label: '黄橙肤',  match: (c) => isInRange(c, [20,60], [100,255], [0,100]) },
  { id: 'green',     label: '绿色系',  match: (c) => isInRange(c, [0,120], [80,255], [0,160]) },
  { id: 'blue',      label: '蓝色系',  match: (c) => isInRange(c, [0,80], [0,160], [100,255]) },
  { id: 'purple',    label: '紫色系',  match: (c) => isInRange(c, [80,180], [0,100], [100,220]) },
  { id: 'pink',      label: '粉色系',  match: (c) => isInRange(c, [180,255], [50,180], [100,220]) },
  { id: 'red',       label: '红色系',  match: (c) => isInRange(c, [150,255], [0,80], [0,100]) },
  { id: 'brown',     label: '棕色系',  match: (c) => isInRange(c, [80,180], [40,130], [10,80]) },
  { id: 'gray',      label: '黑白灰',  match: (c) => { const d = Math.max(c.r,c.g,c.b) - Math.min(c.r,c.g,c.b); return d < 30; } },
  { id: 'morandi',   label: '莫兰迪',  match: (c) => { const avg = (c.r+c.g+c.b)/3; const d = Math.max(c.r,c.g,c.b) - Math.min(c.r,c.g,c.b); return d < 60 && avg > 80 && avg < 200; } },
];

function isInRange(c, rRange, gRange, bRange) {
  return c.r >= rRange[0] && c.r <= rRange[1] &&
         c.g >= gRange[0] && c.g <= gRange[1] &&
         c.b >= bRange[0] && c.b <= bRange[1];
}

/**
 * 加载用户颜色池（默认 = 全部选中）
 */
export function loadUserPalette(brand = 'perler') {
  try {
    const saved = JSON.parse(localStorage.getItem(PALETTE_KEY));
    if (saved && saved.brand === brand) return new Set(saved.ids);
  } catch {}
  // 默认全部选中
  const palette = getPalette(brand);
  return new Set(palette.map((c) => c.id));
}

export function saveUserPalette(ids, brand) {
  localStorage.setItem(PALETTE_KEY, JSON.stringify({ brand, ids: [...ids] }));
}

export function getBaseColorIds() {
  return new Set(BASE_COLOR_IDS);
}

export function isBaseColor(id) {
  return BASE_COLOR_IDS.includes(id);
}

/**
 * 获取用户可用的颜色列表
 */
export function getAvailableColors(brand = 'perler') {
  const palette = getPalette(brand);
  const userIds = loadUserPalette(brand);
  return palette.filter((c) => userIds.has(c.id));
}

// ---- Settings ----

const DEFAULT_SETTINGS = {
  brand: 'perler',
  defaultWidth: 50,
  showLabels: true,
  showGrid: true,
  exportQuality: 'standard',
};

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
