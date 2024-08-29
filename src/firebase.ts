import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyDgtB_hqwL1SS_YMYepRMmXYhmc7154wmU',
  authDomain: 'adamant-messenger.firebaseapp.com',
  databaseURL: 'https://adamant-messenger.firebaseio.com',
  projectId: 'adamant-messenger',
  storageBucket: 'adamant-messenger.appspot.com',
  messagingSenderId: '987518845753',
  appId: '1:987518845753:web:6585b11ca36bac4c251ee8'
}

const firebaseApp = initializeApp(firebaseConfig)
const fcm = getMessaging(firebaseApp)

console.log('Firebase app initialized', firebaseApp)
console.log('FCM instance initialized', fcm)

window.firebaseApp = firebaseApp
window.fcm = fcm

export { firebaseApp, fcm }
