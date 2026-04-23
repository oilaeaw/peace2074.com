import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const BlogPostSchema = new Schema(
    {
        _id: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        excerpt: { type: String, default: '' },
        content: { type: String, required: true },
        tags: [{ type: String }],
        date: { type: String },
        author: { type: String },
        embedding: [{ type: Number }],
    },
    { timestamps: true, collection: 'BlogPost' }
)

export const BlogPostModel = models.BlogPost || model('BlogPost', BlogPostSchema)
