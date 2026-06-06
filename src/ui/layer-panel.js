/**
 * 颜色图层面板 UI
 */

import { getState, toggleColorLayer, showAllLayers } from '../core/app-state.js';
import { renderGrid } from '../core/grid-renderer.js';

/**
 * 初始化图层面板
 */
export function initLayerPanel() {
  const layersList = document.getElementById('layersList');
  const showAllBtn = document.getElementById('showAllLayers');
  const statsSection = document.getElementById('statsSection');
  const statsBody = document.getElementById('statsBody');
  const statsTotal = document.getElementById('statsTotal');
  const canvas = document.getElementById('mainCanvas');

  showAllBtn.addEventListener('click', () => {
    showAllLayers();
    renderGrid(canvas);
    updateLayerHighlights();
  });

  // 订阅状态变化
  import('../core/app-state.js').then(({ subscribe }) => {
    subscribe((state) => {
      if (state.isReady) {
        renderLayersList(state, layersList, canvas);
        renderStats(state, statsSection, statsBody, statsTotal);
      }
    });
  });
}

/**
 * 渲染图层列表（新版 chip 卡片）
 */
function renderLayersList(state, container, canvas) {
  const { layers, activeColors, singleLayerMode } = state;

  if (layers.length === 0) {
    container.innerHTML = '<p class="layers-placeholder">生成图纸后显示颜色列表</p>';
    return;
  }

  container.innerHTML = '';

  for (const layer of layers) {
    const chip = document.createElement('div');
    chip.className = 'layer-chip';
    chip.dataset.beadId = layer.beadId;

    if (singleLayerMode) {
      chip.classList.add(activeColors.has(layer.beadId) ? 'active' : 'dimmed');
    }

    chip.innerHTML = `
      <div class="layer-chip__swatch" style="background:${layer.hex}"></div>
      <div class="layer-chip__info">
        <div class="layer-chip__name">${layer.beadId} ${layer.name}</div>
        <div class="layer-chip__count">${layer.count} 颗</div>
      </div>
      <div class="layer-chip__check">✓</div>
    `;

    chip.addEventListener('click', () => {
      toggleColorLayer(layer.beadId);
      renderGrid(canvas);
      updateLayerHighlights();
    });

    container.appendChild(chip);
  }
}

/**
 * 更新图层高亮状态
 */
function updateLayerHighlights() {
  const state = getState();
  const items = document.querySelectorAll('.layer-chip');
  items.forEach((item) => {
    const beadId = item.dataset.beadId;
    item.classList.remove('active', 'dimmed');
    if (state.singleLayerMode) {
      item.classList.add(state.activeColors.has(beadId) ? 'active' : 'dimmed');
    }
  });
}

/**
 * 渲染统计清单（新版列表）
 */
function renderStats(state, section, body, totalEl) {
  const { layers, cells } = state;
  if (layers.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  totalEl.textContent = `总计 ${cells.length} 颗 · ${layers.length} 种颜色`;

  body.innerHTML = '';
  for (const layer of layers) {
    const row = document.createElement('div');
    row.className = 'stats-row';
    row.innerHTML = `
      <span class="stats-row__dot" style="background:${layer.hex}"></span>
      <span class="stats-row__name">${layer.beadId} ${layer.name}</span>
      <span class="stats-row__count">${layer.count}</span>
    `;
    body.appendChild(row);
  }
}
