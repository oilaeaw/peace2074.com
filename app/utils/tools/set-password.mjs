import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI
if (!uri) {
  console.error('No MongoDB URI found in env')
  process.exit(2)
}

async function run() {
  const [, , email, newPass] = process.argv
  if (!email || !newPass) {
    console.error('Usage: node tools/set-password.mjs <email> <newPassword>')
    process.exit(2)
  }
  await mongoose.connect(uri, { dbName: new URL(uri.replace(/'/g, '')).pathname.replace('/', '') || undefined })
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users')
  const u = await User.findOne({ email })
  if (!u) {
    console.error('User not found')
    await mongoose.disconnect()
    process.exit(1)
  }
  const hash = await bcrypt.hash(newPass, 10)
  u.password = hash
  await u.save()
  console.log('Password updated for', email)
  await mongoose.disconnect()
}

run().catch((err) => { console.error(err); process.exit(1) })
