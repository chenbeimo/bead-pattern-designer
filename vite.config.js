import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // GitHub Pages 子目录部署 — 路径必须匹配仓库名
  base: '/bead-pattern-designer/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
