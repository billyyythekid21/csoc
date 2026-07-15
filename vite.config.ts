import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Without an explicit entry, Vite globs the whole project tree for *.html
  // files to seed dependency pre-bundling. This repo also contains Python
  // virtualenvs (.venv, venv, backend/venv) and a separate mobile/ app, which
  // makes that scan extremely slow (or effectively hang) since it crawls
  // huge/unrelated directories (e.g. PyTorch ships an .html file). Restrict
  // the scan to the actual app entry point.
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    watch: {
      ignored: ['**/.venv/**', '**/venv/**', '**/backend/venv/**', '**/mobile/**'],
    },
  },
})
