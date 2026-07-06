# 🧩 拼豆图纸生成器 — Bead Pattern Designer

将任意图片转换为拼豆（Perler/Hama/Artkal）图纸，支持交互式编辑、用量统计、导出 PNG/PDF。

## 功能特性

- 📷 **图片上传**：支持拖拽上传和点击上传，自动网格化
- 🎨 **颜色映射**：CIELAB 颜色空间精确匹配，支持 Perler/Hama/Artkal 三大品牌
- 📐 **网格化**：自定义网格宽度（10-200格），高度按比例自动计算
- ✏️ **像素编辑器**：点击/拖拽绘图，支持撤销/重做（含批量笔画合并）
- 🔍 **缩放查看**：滚轮缩放（5-60px），显示/隐藏色号编号和网格线
- 🎨 **颜色选择器**：按色系分类、搜索过滤、用户颜色池管理
- 📊 **用量统计**：每种颜色用量清单，方便采购
- 📥 **导出**：PNG 图片 / PDF 打印稿（含颜色用量表格）
- 💾 **项目管理**：保存/加载/收藏/删除，自动生成缩略图
- 📱 **响应式**：手机/电脑自适应布局，移动端触摸优化

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（Vite，支持热更新）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

1. 推送代码到 GitHub 仓库的 `main` 分支
2. 在仓库 Settings → Pages 中选择 "GitHub Actions" 作为 Source
3. 每次推送自动构建并部署

## 技术栈

- **前端**：Vanilla JS (ES Modules) + HTML Canvas
- **颜色匹配**：CIELAB (L\*a\*b\*) 颜色空间 Delta-E 距离
- **PDF 导出**：jsPDF
- **构建**：Vite
- **托管**：GitHub Pages
- **部署**：GitHub Actions

## 项目结构

```
├── index.html                # 单页应用入口
├── vite.config.js            # Vite 构建配置
├── package.json
├── serve.py                  # 备用 Python 开发服务器
├── src/
│   ├── main.js               # 入口，初始化所有模块
│   ├── core/
│   │   └── app-state.js      # 全局状态管理（不可变 + 批处理撤销）
│   ├── data/
│   │   ├── bead-palette.js   # 拼豆颜色数据库（3 品牌 110 色）
│   │   ├── projects.js       # 项目存储（localStorage + RLE 压缩）
│   │   └── user-palette.js   # 用户颜色池 & 设置
│   ├── utils/
│   │   └── color-matcher.js  # CIELAB 颜色匹配算法（含 LAB 缓存）
│   ├── ui/
│   │   ├── router.js         # 页面路由 & 底部栏切换
│   │   ├── editor.js         # 像素编辑器（Canvas 绘图/缩放/手势）
│   │   ├── color-picker.js   # 颜色选择器（分类/搜索/勾选）
│   │   ├── modal.js          # 画布大小设置弹窗
│   │   ├── projects.js       # 项目列表渲染
│   │   ├── settings.js       # 设置页
│   │   ├── image-upload.js   # 图片上传 → 网格化
│   │   ├── exporter.js       # PNG / PDF 导出
│   │   └── toast.js          # 轻提示
│   └── styles/
│       └── main.css          # 设计系统（CSS 自定义属性）
└── .github/workflows/
    └── deploy.yml            # GitHub Pages 自动部署
```

## License

MIT
