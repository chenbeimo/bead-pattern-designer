/**
 * 全局状态管理
 */

const state = {
  // 图片相关
  sourceImage: null,       // HTMLImageElement
  sourceWidth: 0,
  sourceHeight: 0,

  // 网格设置
  gridWidth: 50,
  gridHeight: 0,

  // 网格数据
  cells: [],               // [{x, y, beadId, r, g, b, name}]
  layers: [],              // [{beadId, name, count, r, g, b, hex}]

  // 图层状态
  activeColors: new Set(), // 当前高亮的色号集合，空 = 全显
  singleLayerMode: false,  // 是否为单层模式

  // 显示选项
  showLabels: true,
  showGrid: true,
  cellSize: 20,            // 屏幕像素/格子

  // 品牌
  brand: 'perler',

  // 状态标记
  isReady: false,
};

const listeners = [];

/**
 * 订阅状态变化
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/**
 * 更新状态并通知订阅者
 */
export function setState(updates) {
  Object.assign(state, updates);
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error(e); }
  }
}

/**
 * 获取当前状态（只读引用）
 */
export function getState() {
  return state;
}

/**
 * 切换颜色层可见性
 */
export function toggleColorLayer(beadId) {
  const s = state;
  if (s.activeColors.has(beadId)) {
    s.activeColors.delete(beadId);
  } else {
    s.activeColors.add(beadId);
  }
  s.singleLayerMode = s.activeColors.size > 0;
  // 触发更新
  setState({ activeColors: s.activeColors, singleLayerMode: s.singleLayerMode });
}

/**
 * 显示所有颜色层
 */
export function showAllLayers() {
  setState({ activeColors: new Set(), singleLayerMode: false });
}
