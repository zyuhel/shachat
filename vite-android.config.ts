import { mergeConfig, defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import viteBaseConfig from './vite-base.config'
import { manifest } from './vite-config/manifest'
import { excludeScreenshotsPlugin } from './vite-config/plugins/excludeScreenshotsPlugin'

export default mergeConfig(
  viteBaseConfig,
  defineConfig({
    build: {
      outDir: './dist-android'
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        srcDir: 'src',
        filename: 'service-worker.js',
        devOptions: {
          enabled: false
        },
        manifest: manifest,
        manifestFilename: 'manifest.json',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
          maximumFileSizeToCacheInBytes: 5000000 // 5 MiB
        }
      }),
      excludeScreenshotsPlugin()
    ]
  })
)
