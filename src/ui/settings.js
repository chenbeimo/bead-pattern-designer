/**
 * 设置页
 */
import { loadSettings, saveSettings, loadUserPalette } from '../data/user-palette.js';
import { getState, setState } from '../core/app-state.js';
import { showToast } from './toast.js';

export function initSettings() {
  const settings = loadSettings();

  const brandSelect = document.getElementById('settingBrand');
  const widthSlider = document.getElementById('settingDefaultWidth');
  const widthVal = document.getElementById('settingDefaultWidthVal');
  const showLabels = document.getElementById('settingShowLabels');
  const showGrid = document.getElementById('settingShowGrid');
  const clearBtn = document.getElementById('btnClearData');

  // 恢复值
  brandSelect.value = settings.brand;
  widthSlider.value = settings.defaultWidth;
  widthVal.textContent = settings.defaultWidth;
  showLabels.checked = settings.showLabels;
  showGrid.checked = settings.showGrid;

  // 品牌切换
  brandSelect.addEventListener('change', (e) => {
    const brand = e.target.value;
    const palette = loadUserPalette(brand);
    setState({ brand, userPalette: palette });
    saveSettings({ ...loadSettings(), brand });
  });

  // 默认宽度
  widthSlider.addEventListener('input', (e) => {
    widthVal.textContent = e.target.value;
    saveSettings({ ...loadSettings(), defaultWidth: parseInt(e.target.value) });
  });

  // 显示选项
  showLabels.addEventListener('change', (e) => {
    saveSettings({ ...loadSettings(), showLabels: e.target.checked });
  });
  showGrid.addEventListener('change', (e) => {
    saveSettings({ ...loadSettings(), showGrid: e.target.checked });
  });

  // 清空数据
  clearBtn.addEventListener('click', () => {
    if (confirm('确定清空所有自制图纸、收藏和设置？此操作不可撤销。')) {
      localStorage.removeItem('bead-projects');
      localStorage.removeItem('bead-favorites');
      localStorage.removeItem('bead-user-palette');
      localStorage.removeItem('bead-settings');
      showToast('已清空所有数据');
      setTimeout(() => location.reload(), 800);
    }
  });
}
