import type { Document } from 'mongoose'
import mongoose, { Schema, Types } from 'mongoose'

export interface OAuthLogDocument extends Document {
  provider: string
  direction: 'auth-url' | 'callback' | 'start'
  url: string
  callbackURL?: string
  clientId?: string
  host?: string
  proto?: string
  query?: Record<string, any>
  headers?: Record<string, any>
  userId?: Types.ObjectId
  profileId?: string
  email?: string
  outcome?: 'success' | 'failure' | 'init'
  error?: string
  createdAt: Date
}

const OAuthLogSchema: Schema = new Schema<OAuthLogDocument>({
  provider: { type: String, required: true, index: true },
  direction: { type: String, required: true, enum: ['auth-url', 'callback', 'start'] },
  url: { type: String, required: true },
  callbackURL: { type: String },
  clientId: { type: String },
  host: { type: String },
  proto: { type: String },
  query: { type: Schema.Types.Mixed },
  headers: { type: Schema.Types.Mixed },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  profileId: { type: String },
  email: { type: String },
  outcome: { type: String, enum: ['success', 'failure', 'init'] },
  error: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
})

const OAuthLog = mongoose.models.OAuthLog || mongoose.model<OAuthLogDocument>('OAuthLog', OAuthLogSchema)

export default OAuthLog
