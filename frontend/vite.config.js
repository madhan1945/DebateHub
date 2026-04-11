import path from 'node:path';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

function loadJsAsJsx() {
  return {
    name: 'load-js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!/[\\/]frontend[\\/](app|components|lib)[\\/].*\.js$/.test(id)) {
        return null;
      }

      return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frontendEnv = {
    INTERNAL_API_URL: env.INTERNAL_API_URL || '',
    VITE_API_URL: env.VITE_API_URL || '/api',
    VITE_GOOGLE_CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID || '',
    NODE_ENV: mode === 'production' ? 'production' : 'development',
    PORT: env.PORT || '',
  };

  return {
    plugins: [loadJsAsJsx(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env': JSON.stringify(frontendEnv),
    },
    esbuild: {
      loader: 'jsx',
      include: /.*\.jsx?$/,
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});
