/* eslint-disable */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyDgtB_hqwL1SS_YMYepRMmXYhmc7154wmU',
  authDomain: 'adamant-messenger.firebaseapp.com',
  databaseURL: 'https://adamant-messenger.firebaseio.com',
  projectId: 'adamant-messenger',
  storageBucket: 'adamant-messenger.appspot.com',
  messagingSenderId: '987518845753',
  appId: '1:987518845753:web:6585b11ca36bac4c251ee8'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] BACKGROUND MESSAGE', payload)
  // Customize notification here
  const notificationTitle = payload.notification?.title
  const notificationOptions = {
    body: payload.notification?.body
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

messaging.onMessage((payload) => {
  console.log('[SW] MESSAGE', payload)
  // Customize notification here
  const notificationTitle = payload.notification?.title
  const notificationOptions = {
    body: payload.notification?.body
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
