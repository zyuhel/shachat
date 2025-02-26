import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import electron from 'vite-plugin-electron'
import viteBaseConfig from './vite-base.config'
import { excludeScreenshotsPlugin } from './vite-config/plugins/excludeScreenshotsPlugin'

export default mergeConfig(
  viteBaseConfig,
  defineConfig({
    build: {
      outDir: './dist-electron'
    },
    plugins: [
      electron({
        entry: 'src/electron/main.js'
      }),
      excludeScreenshotsPlugin()
    ]
  })
)
