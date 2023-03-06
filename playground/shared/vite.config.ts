import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import { vitePluginShared } from 'vite-plugin-shared';

function pathResolve(dir) {
  return resolve(__dirname, '.', dir);
}

export default defineConfig(({ mode }) => ({
  base: '',
  plugins: [vue(), vitePluginShared()],
  resolve: {
    alias: {
      '/@': pathResolve('src'),
      // 公共ts类型
      '/#': pathResolve('types'),
    },
  },
  optimizeDeps: {
    include: ['axios'],
  },
  build: {
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'assets',
    // minify: 'terser', // 混淆器
    sourcemap: mode !== 'production',
    // 解决腾讯内核，css rgba转换为 #RGBA导致不能正常渲染的bug
    cssTarget: ['chrome61'],
  },
  server: {
    cors: true,
    open: false,
    host: true,
    port: 4001,
  },
}));
