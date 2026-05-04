import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const TasbeehSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    daily: { type: Schema.Types.Mixed, default: [] },
    sessions: { type: Schema.Types.Mixed, default: [] }
  },
  { timestamps: true, collection: "Tasbeeh" }
);
const TasbeehModel = models.Tasbeeh || model("Tasbeeh", TasbeehSchema);

export { TasbeehModel as T };
//# sourceMappingURL=Tasbeeh.mjs.map
