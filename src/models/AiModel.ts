import mongoose, { Schema } from "mongoose";

const aiSchema = new mongoose.Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Posts" },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Ai = mongoose.model("Ai", aiSchema);

export default Ai;
