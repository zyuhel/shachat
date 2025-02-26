import { ManifestOptions } from 'vite-plugin-pwa'

export const manifest: Partial<ManifestOptions> = {
  name: 'ADAMANT Messenger',
  short_name: 'ADAMANT',
  description:
    'ADAMANT is a decentralized anonymous messenger based on the blockchain system. It’s independent of any governments or corporations, and even developers due to the distributed network infrastructure that contains an open-source code.',
  icons: [
    {
      src: '/img/icons/android-chrome-36x36.png',
      sizes: '36x36',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-48x48.png',
      sizes: '48x48',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-72x72.png',
      sizes: '72x72',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-96x96.png',
      sizes: '96x96',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-144x144.png',
      sizes: '144x144',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-256x256.png',
      sizes: '256x256',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-384x384.png',
      sizes: '384x384',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/img/icons/android-chrome-1024x1024.png',
      sizes: '1024x1024',
      type: 'image/png'
    }
  ],
  dir: 'ltr',
  lang: 'en',
  orientation: 'natural',
  start_url: '/index.html',
  display: 'standalone',
  display_override: ['standalone', 'browser'],
  related_applications: [
    {
      platform: 'itunes',
      url: 'https://apps.apple.com/app/adamant-messenger/id1341473829'
    },
    {
      platform: 'play',
      url: 'https://play.google.com/store/apps/details?id=im.adamant.adamantmessengerpwa&pli=1'
    }
  ],
  prefer_related_applications: true,
  shortcuts: [
    {
      name: 'Wallet',
      url: '/home',
      icons: [
        {
          src: '/img/icons/android-chrome-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'Chats',
      url: '/chats',
      icons: [
        {
          src: '/img/icons/android-chrome-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'Settings',
      url: '/options',
      icons: [
        {
          src: '/img/icons/android-chrome-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    }
  ],
  scope: 'https://msg.adamant.im',
  categories: ['finance', 'social', 'crypto', 'security', 'blockchain'],
  background_color: '#000000',
  theme_color: '#4DBA87',

  screenshots: [
    {
      src: '/screenshots/android/0-login.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Login with password',
      platform: 'android'
    },
    {
      src: '/screenshots/android/screenshot-mobile.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Login',
      platform: 'android'
    },
    {
      src: '/screenshots/android/1-balances.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Account balance',
      platform: 'android'
    },
    {
      src: '/screenshots/android/2-exchanges.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Adamant exchanges',
      platform: 'android'
    },
    {
      src: '/screenshots/android/3-send_funds.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Send funds',
      platform: 'android'
    },
    {
      src: '/screenshots/android/4-partners.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: "Partner's info",
      platform: 'android'
    },
    {
      src: '/screenshots/android/5-start_new_chat.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Start new chat',
      platform: 'android'
    },
    {
      src: '/screenshots/android/6-nodes.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Nodes list',
      platform: 'android'
    },
    {
      src: '/screenshots/android/7-votes.png',
      sizes: '1334x750',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Votes',
      platform: 'android'
    },
    {
      src: '/screenshots/ios/iOS1.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Chats in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS2.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Chats in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS3.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Adamant exchanges in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS4.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Adamant exchanges in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS5.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Account balance in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS6.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Account balance in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS7.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Send funds in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS8.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Send funds in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS9.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Wallet list in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS10.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Wallet list in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS11.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'List of nodes in dark theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/ios/iOS12.png',
      sizes: '1125x2436',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'List of nodes in light theme',
      platform: 'ios'
    },
    {
      src: '/screenshots/pwa/pwa1.png',
      sizes: '1280x800',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Login',
      platform: 'chromeos'
    },
    {
      src: '/screenshots/pwa/pwa2.png',
      sizes: '2255x1280',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Adamant exchanges',
      platform: 'chromeos'
    },
    {
      src: '/screenshots/pwa/pwa3.png',
      sizes: '2255x1280',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Send funds',
      platform: 'chromeos'
    },
    {
      src: '/screenshots/pwa/pwa4.png',
      sizes: '2255x1280',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Account balances',
      platform: 'chromeos'
    },
    {
      src: '/screenshots/pwa/pwa5.png',
      sizes: '2255x1280',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Wallet list',
      platform: 'chromeos'
    },
    {
      src: '/screenshots/pwa/pwa6.png',
      sizes: '2255x1280',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Start a new chat',
      platform: 'chromeos'
    }
  ]
}
