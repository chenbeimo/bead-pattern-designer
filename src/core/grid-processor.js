/**
 * 网格处理器：图片 → 拼豆网格数据
 */

import { mapPixelsToBeads } from '../utils/color-matcher.js';
import { getPalette } from '../data/bead-palette.js';
import { getState, setState } from './app-state.js';

/**
 * 将图片处理为拼豆网格
 * @param {HTMLImageElement} img
 * @param {number} targetWidth - 目标网格宽度（格子数）
 * @param {string} brand - 品牌名
 * @returns {{ cells, layers, gridWidth, gridHeight }}
 */
export function processImage(img, targetWidth, brand) {
  const palette = getPalette(brand);

  // 按比例计算网格高度
  const aspect = img.naturalHeight / img.naturalWidth;
  const gridWidth = Math.max(10, Math.min(200, targetWidth));
  const gridHeight = Math.max(10, Math.round(gridWidth * aspect));

  // 用 offscreen canvas 缩放到网格尺寸
  const offCanvas = document.createElement('canvas');
  offCanvas.width = gridWidth;
  offCanvas.height = gridHeight;
  const ctx = offCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0, gridWidth, gridHeight);
  const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);

  // 颜色映射
  const cells = mapPixelsToBeads(imageData.data, gridWidth, gridHeight, palette);

  // 统计颜色层
  const layerMap = new Map();
  for (const cell of cells) {
    if (!layerMap.has(cell.beadId)) {
      layerMap.set(cell.beadId, {
        beadId: cell.beadId,
        name: cell.name,
        r: cell.r,
        g: cell.g,
        b: cell.b,
        hex: rgbToHex(cell.r, cell.g, cell.b),
        count: 0,
      });
    }
    layerMap.get(cell.beadId).count++;
  }

  // 按用量降序排列
  const layers = Array.from(layerMap.values()).sort((a, b) => b.count - a.count);

  // 更新全局状态
  setState({
    sourceImage: img,
    sourceWidth: img.naturalWidth,
    sourceHeight: img.naturalHeight,
    gridWidth,
    gridHeight,
    cells,
    layers,
    brand,
    activeColors: new Set(),
    singleLayerMode: false,
    isReady: true,
  });

  return { cells, layers, gridWidth, gridHeight };
}

/**
 * RGB 转 Hex 字符串
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * 从文件加载图片
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
