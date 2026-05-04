import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const DeployLikeSchema = new Schema(
  {
    version: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true }
  },
  { timestamps: true, collection: "DeployLike" }
);
DeployLikeSchema.index({ version: 1, userId: 1 }, { unique: true });
const DeployLikeModel = models.DeployLike || model("DeployLike", DeployLikeSchema);

export { DeployLikeModel as D };
//# sourceMappingURL=DeployLike.mjs.map
