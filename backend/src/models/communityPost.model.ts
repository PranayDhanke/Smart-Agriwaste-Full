import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    userId: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    userImage: { type: String, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const communityPostSchema = new Schema(
  {
    authorId: { type: String, required: true, trim: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorImage: { type: String, default: "" },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "general", trim: true },
    likes: [{ type: String, trim: true }],
    saves: [{ type: String, trim: true }],
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CommunityPost", communityPostSchema);
