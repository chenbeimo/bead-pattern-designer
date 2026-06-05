/**
 * 颜色匹配模块
 * 支持 RGB 欧几里得距离和 CIELAB 颜色空间距离
 */

// sRGB → XYZ → CIELAB 转换工具

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return {
    x: 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb,
    y: 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb,
    z: 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb,
  };
}

function xyzToLab(x, y, z) {
  // D65 白点
  const xn = 0.95047, yn = 1.00000, zn = 1.08883;
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * 将 RGB 转换为 CIELAB
 */
export function rgbToLab(r, g, b) {
  const { x, y, z } = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * 计算两个 CIELAB 颜色的欧几里得距离（ΔE*ab）
 */
function labDistance(lab1, lab2) {
  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * 计算两个 RGB 颜色的欧几里得距离
 */
function rgbDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 预计算颜色库的 LAB 值缓存
 */
let _labCache = new Map();

function ensureLabCache(palette) {
  const key = palette.length + '_' + palette[0]?.id;
  if (_labCache.has(key)) return _labCache.get(key);
  const labColors = palette.map((c) => ({
    ...c,
    lab: rgbToLab(c.r, c.g, c.b),
  }));
  _labCache.set(key, labColors);
  return labColors;
}

/**
 * 在颜色库中找到最近邻匹配
 * @param {number} r - 目标颜色 R (0-255)
 * @param {number} g - 目标颜色 G (0-255)
 * @param {number} b - 目标颜色 B (0-255)
 * @param {Array} palette - 拼豆颜色库
 * @param {'lab'|'rgb'} mode - 匹配模式
 * @returns {Object} 匹配到的颜色对象
 */
export function findClosestColor(r, g, b, palette, mode = 'lab') {
  if (mode === 'lab') {
    const labColors = ensureLabCache(palette);
    const targetLab = rgbToLab(r, g, b);
    let minDist = Infinity;
    let best = labColors[0];
    for (let i = 0; i < labColors.length; i++) {
      const d = labDistance(targetLab, labColors[i].lab);
      if (d < minDist) {
        minDist = d;
        best = labColors[i];
      }
    }
    return best;
  }

  // RGB 模式
  let minDist = Infinity;
  let best = palette[0];
  for (let i = 0; i < palette.length; i++) {
    const d = rgbDistance(r, g, b, palette[i].r, palette[i].g, palette[i].b);
    if (d < minDist) {
      minDist = d;
      best = palette[i];
    }
  }
  return best;
}

/**
 * 批量匹配：将像素数据映射到颜色库
 * @param {Uint8ClampedArray} imageData - getImageData() 返回的像素数据
 * @param {number} width - 图像宽度（像素数）
 * @param {number} height - 图像高度（像素数）
 * @param {Array} palette - 拼豆颜色库
 * @returns {Array} 网格数据
 */
export function mapPixelsToBeads(imageData, width, height, palette) {
  const labColors = ensureLabCache(palette);
  const cells = new Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];

      const targetLab = rgbToLab(r, g, b);
      let minDist = Infinity;
      let best = labColors[0];

      for (let i = 0; i < labColors.length; i++) {
        const d = labDistance(targetLab, labColors[i].lab);
        if (d < minDist) {
          minDist = d;
          best = labColors[i];
        }
      }

      cells[y * width + x] = {
        x, y,
        beadId: best.id,
        r: best.r,
        g: best.g,
        b: best.b,
        name: best.name,
      };
    }
  }

  return cells;
}
