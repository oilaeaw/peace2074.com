import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface UserDocument extends Document {
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)

export default User
