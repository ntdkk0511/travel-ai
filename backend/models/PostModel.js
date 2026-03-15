import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  planId: String,
  title: { type: String, required: true },
  plan: { type: String, required: true },
  comment: { type: String, default: "" },
  photos: [String],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);