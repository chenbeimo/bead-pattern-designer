import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 生产环境压缩
    minify: 'terser',
    rollupOptions: {
      output: {
        // 单文件输出，减少请求
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
