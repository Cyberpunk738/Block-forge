import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // Exercise Mammoth's real browser implementation; its Node entry expects buffers/paths.
  resolve: { alias: [{ find: /^mammoth$/, replacement: fileURLToPath(new URL('./node_modules/mammoth/mammoth.browser.js', import.meta.url)) }] },
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.js'] },
});
