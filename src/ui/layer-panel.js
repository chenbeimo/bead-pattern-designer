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

  // 订阅状态变化，重新渲染图层列表
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
 * 渲染图层列表
 */
function renderLayersList(state, container, canvas) {
  const { layers, activeColors, singleLayerMode } = state;

  if (layers.length === 0) {
    container.innerHTML = '<p class="layers-placeholder">上传图片并生成图纸后显示颜色列表</p>';
    return;
  }

  container.innerHTML = '';

  for (const layer of layers) {
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.dataset.beadId = layer.beadId;

    // 高亮/淡化逻辑
    if (singleLayerMode) {
      item.classList.add(activeColors.has(layer.beadId) ? 'active' : 'dimmed');
    }

    item.innerHTML = `
      <span class="layer-swatch" style="background:${layer.hex}"></span>
      <span class="layer-label">${layer.beadId} ${layer.name}</span>
      <span class="layer-count">${layer.count}颗</span>
    `;

    item.addEventListener('click', () => {
      toggleColorLayer(layer.beadId);
      renderGrid(canvas);
      updateLayerHighlights();
    });

    container.appendChild(item);
  }
}

/**
 * 更新图层列表高亮状态
 */
function updateLayerHighlights() {
  const state = getState();
  const items = document.querySelectorAll('.layer-item');
  items.forEach((item) => {
    const beadId = item.dataset.beadId;
    item.classList.remove('active', 'dimmed');
    if (state.singleLayerMode) {
      item.classList.add(state.activeColors.has(beadId) ? 'active' : 'dimmed');
    }
  });
}

/**
 * 渲染统计清单
 */
function renderStats(state, section, body, totalEl) {
  const { layers, cells } = state;
  if (layers.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  totalEl.textContent = `总计: ${cells.length} 颗, ${layers.length} 种颜色`;

  body.innerHTML = '';
  for (const layer of layers) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${layer.beadId}</td>
      <td><span class="color-dot" style="background:${layer.hex}"></span>${layer.name}</td>
      <td>${layer.count}</td>
    `;
    body.appendChild(tr);
  }
}
