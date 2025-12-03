import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface UserDocument extends Document {
  email: string
  password: string
  username: string
  createdAt: Date
  updatedAt: Date
  first_name?: string
  last_name?: string
  role?: string
  verified: boolean // added
  verificationToken?: string // added
  verificationTokenExpires?: Date // added
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, sparse: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  first_name: { type: String },
  last_name: { type: String },
  role: { type: String, default: 'user' },
  verified: { type: Boolean, default: false }, // added
  verificationToken: { type: String }, // added
  verificationTokenExpires: { type: Date }, // added
})

const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)

export default User
