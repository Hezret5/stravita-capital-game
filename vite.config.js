import { defineConfig } from 'vite';

// Конфигурация сборки: относительные пути — игра работает из любой папки и в <iframe>
export default defineConfig({
  base: './',
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 8192
  }
});
