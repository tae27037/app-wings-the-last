import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CSS Modules work out of the box for every *.module.css file.
export default defineConfig({
  plugins: [react()],
  css: {
    modules: { localsConvention: 'camelCase' },
  },
});
