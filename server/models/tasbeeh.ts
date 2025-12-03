import mongoose from 'mongoose'

const TasbeehSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  // totals per day stored as an array of { date: String, total: Number, sessions: Number }
  daily: [
    {
      date: { type: String },
      total: { type: Number, default: 0 },
      sessions: { type: Number, default: 0 },
    },
  ],
  // sessions history: each session stores phrase index, count, target and createdAt
  sessions: [
    {
      phraseIndex: { type: Number },
      count: { type: Number },
      target: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true })

export default mongoose.models.Tasbeeh || mongoose.model('Tasbeeh', TasbeehSchema)
