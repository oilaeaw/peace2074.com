import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const ReaderStatsSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sura: { type: Number, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { collection: "ReaderStats" }
);
const ReaderStatsModel = models.ReaderStats || model("ReaderStats", ReaderStatsSchema);

export { ReaderStatsModel as R };
//# sourceMappingURL=ReaderStats.mjs.map
