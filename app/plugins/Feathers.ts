import auth from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'

export default defineNuxtPlugin((nuxtApp) => {
  const $q = useQuasar()
  const isClient = typeof window !== 'undefined'

  const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030', {
    path: 'http://localhost:3030',
    transports: ['websocket'],
  })

  const hapi = feathers()
  hapi.configure(socketio(socket))

  if (isClient) {
    hapi.configure(auth({
      storage: window.localStorage,
    }))

    // Optional: reconnect or alert on disconnect
    socket.on('disconnect', () => {
      $q.notify({ message: 'Disconnected from server', type: 'warning' })
    })

    // Realtime listener
    hapi.service('messages').on('created', (message) => {
      $q.notify({ message: message.text || 'New message received', type: 'info' })
    })

    // Check if user is already authenticated
    hapi.authenticate().catch(async () => {
      await hapi.logout()
      $q.notify({ message: 'User not authenticated', type: 'negative' })
    })
  }

  nuxtApp.provide('hapi', hapi)
})
