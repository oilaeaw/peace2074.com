import mongoose from 'mongoose'

const uri = import.meta.env.MONGODB_URI || import.meta.env.MONGODB_URL || process.env.MONGO_URI
if (!uri) {
  console.error('No MongoDB URI found in env')
}

async function run() {
  await mongoose.connect(uri, { dbName: new URL(uri).pathname.replace('/', '') || undefined })
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users')
  const u = await User.findOne({ email: 'wahbehw@gmail.com' }).lean()
  if (!u) {
    console.warn('User not found')
    return 0
  }
  console.warn('User:', {
    email: u.email,
    username: u.username,
    verified: u.verified,
    passwordHash: u.password,
    _id: u._id,
  })
  await mongoose.disconnect()
}
run().catch(err => console.error(err))
