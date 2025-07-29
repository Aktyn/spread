import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const ReactCompilerConfig = {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
          "@babel/plugin-proposal-explicit-resource-management",
        ],
      },
    }),
    tailwindcss(),
    {
      name: 'reload',
      configureServer(server) {
        const {
          ws,
          watcher
        } = server;
        watcher.on('change', () => {
          ws.send({
            type: 'full-reload',
          });
        });
      },
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
