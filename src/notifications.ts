import { getToken, deleteToken } from 'firebase/messaging'
import { fcm } from './firebase'

export async function requestToken() {
  let permission: NotificationPermission
  try {
    permission = await Notification.requestPermission()
  } catch (err) {
    console.log('An error occurred while requesting notifications permission', err)
    return null
  }

  if (permission !== 'granted') {
    console.log('Notification permission not granted.')
    return null
  }
  console.log('Notification permission granted.')

  try {
    // Get the registration token
    const currentToken = await getToken(fcm)
    if (currentToken) {
      console.log('FCM registration token:', currentToken)
      return currentToken
      // Send the token to your server and save it for later
    } else {
      console.log('No registration token available. Request permission to generate one.')

      return null
    }
  } catch (err) {
    console.log('An error occurred while retrieving the FCM token', err)

    return null
  }
}

export async function revokeToken() {
  try {
    await deleteToken(fcm)
    console.log('FCM registration token deleted.')

    return true
  } catch (err) {
    console.log('An error occurred while deleting the FCM token', err)
    return false
  }
}
