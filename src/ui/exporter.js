/**
 * 导出模块：PNG / PDF
 */
import { getState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';

export function exportPng() {
  const canvas = document.getElementById('editorCanvas');
  const dataUrl = canvas.toDataURL('image/png');
  downloadFile(dataUrl, 'bead-pattern.png');
}

export function exportPdf() {
  const state = getState();
  const { editor } = state;
  const canvas = document.getElementById('editorCanvas');
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('请允许弹窗后重试'); return; }

  const dataUrl = canvas.toDataURL('image/png');
  const palette = getPalette(state.brand);

  // 统计用量
  const counts = {};
  editor.gridData.forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const totalBeads = entries.reduce((s, e) => s + e[1], 0);

  let statsHtml = '';
  if (entries.length > 0) {
    const rows = entries.map(([id, count]) => {
      const c = palette.find((p) => p.id === id);
      const name = c ? c.name : id;
      const hex = c ? `rgb(${c.r},${c.g},${c.b})` : '#ccc';
      return `<tr><td style="border:1px solid #ccc;padding:6px;">${id}</td><td style="border:1px solid #ccc;padding:6px;"><span style="display:inline-block;width:14px;height:14px;background:${hex};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>${name}</td><td style="border:1px solid #ccc;padding:6px;">${count}</td></tr>`;
    }).join('');
    statsHtml = `<div style="margin-top:20px;page-break-before:always;"><h2>用量清单</h2><p>总计: ${totalBeads} 颗, ${entries.length} 种颜色</p><table style="border-collapse:collapse;width:100%;max-width:500px;"><thead><tr><th style="border:1px solid #ccc;padding:6px;text-align:left;">色号</th><th style="border:1px solid #ccc;padding:6px;text-align:left;">颜色</th><th style="border:1px solid #ccc;padding:6px;text-align:left;">数量</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  printWindow.document.write(`<!DOCTYPE html><html><head><title>拼豆图纸</title><style>@page{size:A4;margin:15mm;}body{font-family:sans-serif;text-align:center;}img{max-width:100%;height:auto;}h1{font-size:18px;margin-bottom:10px;}</style></head><body><h1>拼豆图纸 — ${editor.width}×${editor.height}</h1><img src="${dataUrl}" />${statsHtml}<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script></body></html>`);
  printWindow.document.close();
}

function downloadFile(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
