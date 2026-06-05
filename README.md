# 🧩 拼豆图纸生成器 — Bead Pattern Designer

将任意图片转换为拼豆（Perler/Hama/Artkal）图纸，支持颜色分层、用量统计、导出 PNG/PDF。

## 功能特性

- 📷 **图片上传**：支持拖拽上传和点击上传
- 🎨 **颜色映射**：CIELAB 颜色空间精确匹配，支持 Perler/Hama/Artkal 三大品牌
- 📐 **网格化**：自定义网格宽度（10-200格），高度按比例自动计算
- 🔍 **交互查看**：缩放、显示/隐藏色号编号、网格线
- 🎯 **颜色分层**：点击颜色层高亮对应格子，支持多选
- 📊 **用量统计**：每种颜色用量清单，方便采购
- 📥 **导出**：导出 PNG 图纸或 PDF 打印稿（含颜色清单）
- 📱 **响应式**：手机/电脑自适应布局

## 使用方法

### 本地开发

```bash
# 需要 Python 3
python serve.py

# 然后打开 http://localhost:3000
```

### 部署到 GitHub Pages

1. 推送代码到 GitHub 仓库的 `main` 分支
2. 在仓库 Settings → Pages 中选择 "GitHub Actions" 作为 Source
3. 每次推送自动部署

## 技术栈

- **前端**：Vanilla JS + HTML Canvas
- **颜色量化**：CIELAB 颜色空间欧几里得距离
- **托管**：GitHub Pages
- **部署**：GitHub Actions

## 项目结构

```
├── index.html              # 入口页面
├── serve.py                # 开发服务器
├── src/
│   ├── main.js             # 入口 JS
│   ├── styles/
│   │   └── main.css        # 样式
│   ├── data/
│   │   └── bead-palette.js # 拼豆颜色数据库
│   ├── utils/
│   │   └── color-matcher.js # 颜色匹配算法
│   ├── core/
│   │   ├── app-state.js    # 全局状态管理
│   │   ├── grid-processor.js # 图片→网格处理
│   │   └── grid-renderer.js # Canvas 渲染
│   └── ui/
│       ├── toolbar.js      # 工具栏 UI
│       ├── layer-panel.js  # 颜色图层面板
│       └── exporter.js     # 导出功能
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 部署
```

## License

MIT
