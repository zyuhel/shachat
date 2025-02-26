import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
import autoprefixer from 'autoprefixer'
import inject from '@rollup/plugin-inject'
import commonjs from '@rollup/plugin-commonjs'

import { deferScripsPlugin } from './vite-config/plugins/deferScriptsPlugin'
import { preloadCSSPlugin } from './vite-config/plugins/preloadCSSPlugin'
import { excludeBip39Wordlists } from './vite-config/rollup/excludeBip39Wordlists'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    vue(),
    vueJsx(),
    commonjs(),
    inject({
      Buffer: ['buffer', 'Buffer']
    }),
    deferScripsPlugin(),
    preloadCSSPlugin()
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()]
    },
    preprocessorOptions: {
      scss: {
        includePaths: ['./src']
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // Node.js polyfills
      buffer: 'buffer/',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'stream-browserify',
      path: 'path-browserify',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      assert: 'assert'
    },
    extensions: ['.tsx', '.ts', '.js', '.json', '.vue']
  },
  server: {
    port: 8080
  },
  define: {
    'process.env': {} // some old libs like `promise-queue` still uses Webpack
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: []
    },
    rollupOptions: {
      external: [...excludeBip39Wordlists()],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.startsWith('materialdesignicons-webfont')) {
            return 'assets/[name][extname]'
          }

          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
