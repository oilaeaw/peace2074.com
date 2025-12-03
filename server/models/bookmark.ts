import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface BookmarkDocument extends Document {
  userId: string
  bookmark: string
  createdAt: Date
  updatedAt: Date
}

const BookmarkSchema: Schema = new Schema({
  userId: { type: String, required: true },
  bookmark: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Bookmark = mongoose.model<BookmarkDocument>('Bookmark', BookmarkSchema)

export default Bookmark
