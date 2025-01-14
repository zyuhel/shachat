import fs from 'node:fs'
import path from 'node:path'
import { Plugin } from 'vite'

/**
 * Exclude screenshots from Electron bundle
 */
export function excludeScreenshotsPlugin(): Plugin {
  return {
    name: 'exclude-screenshots-plugin',
    writeBundle(outputOptions) {
      const outDir = outputOptions.dir as string
      const screenshotsDir = path.resolve(outDir, 'screenshots')

      fs.rm(screenshotsDir, { recursive: true }, () =>
        console.log(`Deleted screenshots from ${screenshotsDir}`)
      )
    }
  }
}
