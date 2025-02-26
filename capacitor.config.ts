import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'im.adamant.adamantmessengerpwa',
  appName: 'ADAMANT Messenger',
  webDir: 'dist-android',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      androidScaleType: 'CENTER_CROP' // fix logo stretching
    }
  }
}

export default config
