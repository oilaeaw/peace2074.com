import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

function cleanUri(u) {
  if (!u)
    return u
  return u.replace(/^'+|'+$/g, '')
}

const raw = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI
const uri = cleanUri(raw)
if (!uri) {
  console.error('No MongoDB URI found in env')
  process.exit(2)
}

async function run() {
  const [, , email, newPass] = process.argv
  if (!email || !newPass) {
    console.error('Usage: node tools/set-password2.mjs <email> <newPassword>')
    process.exit(2)
  }
  await mongoose.connect(uri)
  const hash = await bcrypt.hash(newPass, 10)
  const Users = mongoose.connection.collection('users')
  const r = await Users.updateOne({ email }, { $set: { password: hash } })
  if (r.matchedCount === 0) {
    console.error('User not found')
    await mongoose.disconnect()
    process.exit(1)
  }
  console.log('Updated password for', email)
  await mongoose.disconnect()
}

run().catch((err) => { console.error(err); process.exit(1) })
