import { Schema, model, models } from 'mongoose'

const QuranProgressSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        completedSuras: [{ type: Number }],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true, collection: 'QuranProgress' }
)

export const QuranProgressModel = models.QuranProgress || model('QuranProgress', QuranProgressSchema)
