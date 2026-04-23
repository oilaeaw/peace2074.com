import { Schema, model, models } from 'mongoose'

const TasbeehSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        daily: { type: Schema.Types.Mixed, default: [] },
        sessions: { type: Schema.Types.Mixed, default: [] },
    },
    { timestamps: true, collection: 'Tasbeeh' }
)

export const TasbeehModel = models.Tasbeeh || model('Tasbeeh', TasbeehSchema)
