import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const UserSchema = new Schema(
    {
        _id: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, default: '' },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true, default: 'user' },
        google_id: { type: String, default: null },
        apple_id: { type: String, default: null },
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        avatar_url: { type: String, default: null },
        github_id: { type: String, default: null },
        permissions: { type: Schema.Types.Mixed, default: [] },
        banned: { type: Boolean, default: false },
        bannedAt: { type: Date, default: null },
        bannedReason: { type: String, default: null },
    },
    { timestamps: true, collection: 'User' }
)

export const UserModel = models.User || model('User', UserSchema)
