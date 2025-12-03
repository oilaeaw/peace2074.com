import mongoose from 'mongoose'

let isConnected = false

export async function connectToDatabase() {
  if (isConnected) {
    return
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peace2074'
  
  try {
    await mongoose.connect(mongoUri)
    isConnected = true
    console.log('🚀 Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

export { mongoose }