/**
 * 网格渲染器：将拼豆网格数据绘制到 Canvas
 */

import { getState } from './app-state.js';

/**
 * 渲染完整网格到 canvas
 * @param {HTMLCanvasElement} canvas
 */
export function renderGrid(canvas) {
  const state = getState();
  if (!state.isReady) return;

  const { cells, gridWidth, gridHeight, cellSize, showLabels, showGrid, activeColors, singleLayerMode } = state;
  const canvasWidth = gridWidth * cellSize;
  const canvasHeight = gridHeight * cellSize;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 绘制每个格子
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const px = cell.x * cellSize;
    const py = cell.y * cellSize;

    const isActive = !singleLayerMode || activeColors.has(cell.beadId);

    if (isActive) {
      // 填充颜色
      ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
      ctx.fillRect(px, py, cellSize, cellSize);

      // 格子编号
      if (showLabels && cellSize >= 12) {
        const brightness = (cell.r * 299 + cell.g * 587 + cell.b * 114) / 1000;
        ctx.fillStyle = brightness > 128 ? '#000000' : '#ffffff';
        ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.4))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.beadId, px + cellSize / 2, py + cellSize / 2);
      }
    } else {
      // 非激活：半透明灰
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(px, py, cellSize, cellSize);
    }

    // 网格线
    if (showGrid) {
      ctx.strokeStyle = isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, cellSize, cellSize);
    }
  }

  // 加粗每 5 格参考线
  if (showGrid && cellSize >= 6) {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridWidth; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvasWidth, y * cellSize);
      ctx.stroke();
    }
  }
}

/**
 * 导出 Canvas 为 PNG 数据 URL
 */
export function canvasToPng(canvas) {
  return canvas.toDataURL('image/png');
}
