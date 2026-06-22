import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const OfflineDownloadDailySchema = new Schema(
    {
        date: { type: String, required: true, unique: true, index: true },
        count: { type: Number, required: true, default: 0 },
    },
    { collection: 'OfflineDownloadDaily' }
)

export const OfflineDownloadDailyModel =
    models.OfflineDownloadDaily || model('OfflineDownloadDaily', OfflineDownloadDailySchema)
