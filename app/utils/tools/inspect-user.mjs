import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI
if (!uri) {
  console.error('No MongoDB URI found in env')
  process.exit(2)
}

async function run() {
  await mongoose.connect(uri, { dbName: new URL(uri).pathname.replace('/', '') || undefined })
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users')
  const u = await User.findOne({ email: 'wahbehw@gmail.com' }).lean()
  if (!u) {
    console.log('User not found')
    process.exit(0)
  }
  console.log('User:', {
    email: u.email,
    username: u.username,
    verified: u.verified,
    passwordHash: u.password,
    _id: u._id,
  })
  await mongoose.disconnect()
}
run().catch((err) => { console.error(err); process.exit(1) })
