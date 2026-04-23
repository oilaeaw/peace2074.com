import { Schema, model, models } from 'mongoose'

const ProfileSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        avatar_url: { type: String, default: null },
        github_id: { type: String, default: null },
        bookmarks: { type: Schema.Types.Mixed, default: [] },
        settings: { type: Schema.Types.Mixed, default: {} },
        tasbeeh_summary: { type: Schema.Types.Mixed, default: { total: 0, sessions: 0 } },
    },
    { timestamps: true, collection: 'Profile' }
)

export const ProfileModel = models.Profile || model('Profile', ProfileSchema)
