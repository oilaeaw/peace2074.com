import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const BlogLikeSchema = new Schema(
  {
    slug: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true }
  },
  { timestamps: true, collection: "BlogLike" }
);
BlogLikeSchema.index({ slug: 1, userId: 1 }, { unique: true });
const BlogLikeModel = models.BlogLike || model("BlogLike", BlogLikeSchema);

export { BlogLikeModel as B };
//# sourceMappingURL=BlogLike.mjs.map
