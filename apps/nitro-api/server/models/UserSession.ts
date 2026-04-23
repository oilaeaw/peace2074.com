import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const UserSessionSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        provider: {
            type: String,
            required: true,
            enum: ['password', 'google', 'apple', 'github', 'passkey', 'otp', 'magic'],
            default: 'password',
        },
        ip: { type: String, default: null },
        user_agent: { type: String, default: null },
        // TTL index: sessions auto-expire from this collection after 30 days
        expires_at: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    },
    { timestamps: true, collection: 'UserSession' }
)

export const UserSessionModel = models.UserSession || model('UserSession', UserSessionSchema)
