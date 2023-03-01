import mongoose, { Schema, Document } from "mongoose";

export interface ICache extends Document {
  key: string;
  value: string;
  ttl: Date;
}

const cacheSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
  ttl: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Cache = mongoose.model<ICache>("Cache", cacheSchema);
