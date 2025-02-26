import { createVuetify, ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

export enum ThemeName {
  Light = 'light',
  Dark = 'dark'
}

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#2E7EED',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#2196F3',
    secondary: '#424242',
    accent: '#FF4081',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00'
  }
}

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',

    themes: {
      [ThemeName.Light]: lightTheme,
      [ThemeName.Dark]: darkTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
