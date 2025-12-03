import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI
if (!uri) { console.error('No MongoDB URI'); process.exit(2) }
async function run() {
  await mongoose.connect(uri.replace(/'/g, ''), { dbName: new URL(uri.replace(/'/g, '')).pathname.replace('/', '') || undefined })
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users')
  const u = await User.findOne({ email: 'wahbehw@gmail.com' }).lean()
  if (!u) { console.log('user not found'); process.exit(0) }
  console.log('stored hash:', u.password)
  console.log('compare 123:', await bcrypt.compare('123', u.password))
  console.log('compare 1234:', await bcrypt.compare('1234', u.password))
  await mongoose.disconnect()
}
run().catch((err) => { console.error(err); process.exit(1) })
