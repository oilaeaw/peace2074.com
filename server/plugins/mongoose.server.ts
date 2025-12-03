import mongoose from 'mongoose'
import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodbUri)
      console.log('MongoDB connected successfully.')
    }
  }
  catch (error) {
    console.error('MongoDB connection error:', error)
  }
})
