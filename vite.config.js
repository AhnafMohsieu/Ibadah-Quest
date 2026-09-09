// vite.config.js
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default {
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        today: resolve(__dirname, 'src/pages/today/today.html'),
        ibadah: resolve(__dirname, 'src/pages/ibadah/ibadah.html'),
      knowledge: resolve(__dirname, 'src/pages/knowledge/knowledge.html'),
      names: resolve(__dirname, 'src/pages/names/names.html'),
      library: resolve(__dirname, 'src/pages/library/library.html'),
        profile: resolve(__dirname, 'src/pages/profile/profile.html')
      }
    }
  }
};
