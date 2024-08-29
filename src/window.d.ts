import { App } from 'vue'
import { Store } from 'vuex'
import { FirebaseApp } from 'firebase/app'
import { Messaging } from 'firebase/messaging'

declare global {
  interface Window {
    ep: App<Element>
    store: Store<any>
    firebaseApp: FirebaseApp
    fcm: Messaging
  }
}
