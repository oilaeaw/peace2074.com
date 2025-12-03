import { Schema, model } from 'mongoose'

export interface IBookmark {
  _id?: string
  userId: string
  chapterNumber: number
  verseNumber: number
  note?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 114
  },
  verseNumber: {
    type: Number,
    required: true,
    min: 1
  },
  note: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

bookmarkSchema.index({ userId: 1, chapterNumber: 1, verseNumber: 1 }, { unique: true })

export const Bookmark = model<IBookmark>('Bookmark', bookmarkSchema)