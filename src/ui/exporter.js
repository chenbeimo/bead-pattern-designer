/**
 * 导出模块：PNG / PDF
 * PDF 使用 jsPDF 直接生成，不依赖弹窗
 */
import { getState } from '../core/app-state.js';
import { getPalette } from '../data/bead-palette.js';

export function exportPng() {
  const canvas = document.getElementById('editorCanvas');
  const dataUrl = canvas.toDataURL('image/png');
  downloadFile(dataUrl, 'bead-pattern.png');
}

export async function exportPdf() {
  const { jsPDF } = await import('jspdf');
  const state = getState();
  const { editor } = state;
  const canvas = document.getElementById('editorCanvas');
  const palette = getPalette(state.brand);

  // 统计用量
  const counts = {};
  editor.gridData.forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const totalBeads = entries.reduce((s, e) => s + e[1], 0);

  // 创建 PDF（A4 竖版）
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;

  // 标题
  pdf.setFontSize(18);
  pdf.text(`拼豆图纸 — ${editor.width}×${editor.height}`, pageW / 2, margin + 5, { align: 'center' });

  // 图片 — 等比缩放，最大宽度 = contentW
  const imgData = canvas.toDataURL('image/png');
  const imgRatio = canvas.width / canvas.height;
  let imgW = contentW;
  let imgH = imgW / imgRatio;
  const maxImgH = 180; // 最大高度 mm
  if (imgH > maxImgH) {
    imgH = maxImgH;
    imgW = imgH * imgRatio;
  }
  const imgX = (pageW - imgW) / 2;
  pdf.addImage(imgData, 'PNG', imgX, margin + 12, imgW, imgH);

  // 用量清单 — 新起一页
  if (entries.length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('用量清单', margin, margin + 5);

    pdf.setFontSize(10);
    pdf.text(`总计: ${totalBeads} 颗, ${entries.length} 种颜色`, margin, margin + 13);

    // 表格
    const rowH = 7;
    let y = margin + 20;
    const colWidths = [25, 60, 30]; // 色号、颜色名、数量
    const headers = ['色号', '颜色', '数量'];

    // 表头
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    let x = margin;
    headers.forEach((h, i) => {
      pdf.rect(x, y, colWidths[i], rowH);
      pdf.text(h, x + 2, y + 5);
      x += colWidths[i];
    });
    y += rowH;

    // 数据行
    pdf.setFont(undefined, 'normal');
    for (const [id, count] of entries) {
      // 换页检查
      if (y + rowH > 297 - margin) {
        pdf.addPage();
        y = margin;
        // 重绘表头
        pdf.setFont(undefined, 'bold');
        let hx = margin;
        headers.forEach((h, i) => {
          pdf.rect(hx, y, colWidths[i], rowH);
          pdf.text(h, hx + 2, y + 5);
          hx += colWidths[i];
        });
        y += rowH;
        pdf.setFont(undefined, 'normal');
      }

      const c = palette.find((p) => p.id === id);
      const name = c ? c.name : id;

      x = margin;
      // 色号
      pdf.rect(x, y, colWidths[0], rowH);
      pdf.text(id, x + 2, y + 5);
      x += colWidths[0];

      // 颜色方块 + 名称
      pdf.rect(x, y, colWidths[1], rowH);
      if (c) {
        pdf.setFillColor(c.r, c.g, c.b);
        pdf.rect(x + 2, y + 1.5, 4, 4, 'F');
      }
      pdf.text(name, x + 8, y + 5);
      x += colWidths[1];

      // 数量
      pdf.rect(x, y, colWidths[2], rowH);
      pdf.text(String(count), x + 2, y + 5);

      y += rowH;
    }
  }

  pdf.save('bead-pattern.pdf');
}

function downloadFile(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
