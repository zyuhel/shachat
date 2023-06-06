import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import autoprefixer from 'autoprefixer'
import { VitePWA } from 'vite-plugin-pwa'
import inject from '@rollup/plugin-inject'
import commonjs from '@rollup/plugin-commonjs'

import { deferScripsPlugin } from './vite-config/plugins/deferScriptsPlugin'
import { preloadCSSPlugin } from './vite-config/plugins/preloadCSSPlugin'
import { excludeBip39Wordlists } from './vite-config/rollup/excludeBip39Wordlists'

export default defineConfig({
  plugins: [
    vue(),
    commonjs(),
    inject({
      Buffer: ['buffer', 'Buffer']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'service-worker.js',
      devOptions: {
        enabled: false
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 // 5 MiB
      }
    }),
    deferScripsPlugin(),
    preloadCSSPlugin()
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()]
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
    extensions: ['.js', '.json', '.vue']
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
      external: [...excludeBip39Wordlists()]
    }
  }
})
