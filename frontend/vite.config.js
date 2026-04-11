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
  // loadEnv reads from .env files on disk only.
  // On Render, frontend/.env.local is gitignored and missing, so we must
  // also check process.env which contains Render dashboard env vars.
  const env = loadEnv(mode, process.cwd(), '');

  const googleClientId =
    env.GOOGLE_CLIENT_ID || env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID ||
    '';

  const frontendEnv = {
    INTERNAL_API_URL: env.INTERNAL_API_URL || process.env.INTERNAL_API_URL || '',
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api',
    GOOGLE_CLIENT_ID: googleClientId,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: googleClientId,
    VITE_GOOGLE_CLIENT_ID: googleClientId,
    NODE_ENV: mode === 'production' ? 'production' : 'development',
    PORT: env.PORT || process.env.PORT || '',
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
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          ws: true,
          changeOrigin: true,
        },
      },
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
