import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        works: resolve(import.meta.dirname, 'works/index.html'),
        webrtcLive: resolve(import.meta.dirname, 'works/webrtc-live/index.html'),
        webrtcBroadcaster: resolve(import.meta.dirname, 'works/webrtc-live/broadcaster.html'),
        webrtcViewer: resolve(import.meta.dirname, 'works/webrtc-live/viewer.html'),
      },
    },
  },
  publicDir: 'public',
});
