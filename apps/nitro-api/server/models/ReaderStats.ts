import { Schema, model, models } from 'mongoose'

const ReaderStatsSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        sura: { type: Number, required: true, index: true },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { collection: 'ReaderStats' }
)

export const ReaderStatsModel = models.ReaderStats || model('ReaderStats', ReaderStatsSchema)
