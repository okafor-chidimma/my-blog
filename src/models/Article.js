import mongoose from "mongoose";
const { Schema, model } = mongoose;
const articleSchema = new Schema({
  name: String,
  upvotes: Number,
  createdAt: String,
  comments: [
    {
      text: String,
      username: String,
      createdAt: String,
    },
  ],
});
//by default mongoose adds id field to every model

export default model("Article", articleSchema);
