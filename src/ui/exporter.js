/**
 * 导出模块：PNG 和 PDF 导出
 */

import { getState } from '../core/app-state.js';

/**
 * 导出当前 Canvas 为 PNG 并下载
 */
export function exportPng() {
  const canvas = document.getElementById('mainCanvas');
  const dataUrl = canvas.toDataURL('image/png');
  downloadFile(dataUrl, 'bead-pattern.png');
}

/**
 * 导出 PDF（使用 Canvas 截图嵌入）
 * 注意：使用简单的打印方案，无需引入重型 jsPDF 库
 */
export function exportPdf() {
  const canvas = document.getElementById('mainCanvas');
  const state = getState();

  // 创建打印用的临时窗口
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('弹窗被阻止，请允许弹窗后重试');
    return;
  }

  const dataUrl = canvas.toDataURL('image/png');

  // 生成颜色清单 HTML
  let statsHtml = '';
  if (state.layers.length > 0) {
    statsHtml = `
      <div style="margin-top:20px;page-break-before:always;">
        <h2>用量清单</h2>
        <p>总计: ${state.cells.length} 颗, ${state.layers.length} 种颜色</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc;padding:6px;text-align:left;">色号</th>
              <th style="border:1px solid #ccc;padding:6px;text-align:left;">颜色</th>
              <th style="border:1px solid #ccc;padding:6px;text-align:left;">数量</th>
            </tr>
          </thead>
          <tbody>
            ${state.layers.map((l) => `
              <tr>
                <td style="border:1px solid #ccc;padding:6px;">${l.beadId}</td>
                <td style="border:1px solid #ccc;padding:6px;">
                  <span style="display:inline-block;width:14px;height:14px;background:${l.hex};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>
                  ${l.name}
                </td>
                <td style="border:1px solid #ccc;padding:6px;">${l.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>拼豆图纸</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: sans-serif; text-align: center; }
        img { max-width: 100%; height: auto; }
        h1 { font-size: 18px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>拼豆图纸 — ${state.gridWidth}×${state.gridHeight}</h1>
      <img src="${dataUrl}" />
      ${statsHtml}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * 触发文件下载
 */
function downloadFile(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
