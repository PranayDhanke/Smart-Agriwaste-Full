import { Request, Response } from "express";
import mongoose from "mongoose";
import CommunityPost from "../models/communityPost.model";
import { AppError } from "../utils/AppError";
import { createNotificationRecord } from "../lib/notifications";
import { getIO } from "../lib/socket";

const normalizeLimit = (rawLimit: unknown, fallback = 10) =>
  Math.min(Number(rawLimit) || fallback, 50);

export const getCommunityPosts = async (req: Request, res: Response) => {
  const { cursor } = req.query;
  const limit = normalizeLimit(req.query.limit, 10);

  const query = cursor ? { _id: { $lt: cursor } } : {};

  const posts = await CommunityPost.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasNext = posts.length > limit;
  if (hasNext) posts.pop();

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      nextCursor: hasNext ? posts[posts.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const createCommunityPost = async (req: Request, res: Response) => {
  const { authorId, authorName, authorImage, description, imageUrl, category } =
    req.body ?? {};

  if (!authorId || !authorName || !description) {
    throw new AppError("Author and description are required", 400);
  }

  const createdPost = await CommunityPost.create({
    authorId: String(authorId),
    authorName: String(authorName).slice(0, 120),
    authorImage: authorImage ? String(authorImage) : "",
    description: String(description).trim().slice(0, 4000),
    imageUrl: imageUrl ? String(imageUrl) : "",
    category: category ? String(category).slice(0, 60) : "general",
    likes: [],
    saves: [],
    replies: [],
  });

  getIO()?.emit("community:post-created", createdPost.toObject());

  res.status(201).json({
    success: true,
    post: createdPost,
  });
};

export const deleteCommunityPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postId = String(id);
  const { userId } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== String(userId)) {
    throw new AppError("You can delete only your own post", 403);
  }

  await CommunityPost.findByIdAndDelete(postId);

  getIO()?.emit("community:post-deleted", { postId });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
};

export const updateCommunityPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postId = String(id);
  const { userId, description, category } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  if (!description || !String(description).trim()) {
    throw new AppError("Description is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== String(userId)) {
    throw new AppError("You can edit only your own post", 403);
  }

  post.description = String(description).trim().slice(0, 4000);
  if (category) {
    post.category = String(category).slice(0, 60);
  }

  await post.save();

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(200).json({
    success: true,
    post,
  });
};

export const toggleCommunityLike = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postId = String(id);
  const { userId, username } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const userIdString = String(userId);
  const alreadyLiked = post.likes.includes(userIdString);

  post.likes = alreadyLiked
    ? post.likes.filter((value) => value !== userIdString)
    : [...post.likes, userIdString];

  await post.save();

  if (!alreadyLiked && post.authorId !== userIdString) {
    await createNotificationRecord({
      userId: post.authorId,
      title: "New like on your farm post",
      message: `${username || "Someone"} liked your community post.`,
      type: "community-like",
    });
  }

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(200).json({
    success: true,
    post,
    liked: !alreadyLiked,
  });
};

export const toggleCommunitySave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postId = String(id);
  const { userId } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const userIdString = String(userId);
  const alreadySaved = post.saves.includes(userIdString);

  post.saves = alreadySaved
    ? post.saves.filter((value) => value !== userIdString)
    : [...post.saves, userIdString];

  await post.save();

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(200).json({
    success: true,
    post,
    saved: !alreadySaved,
  });
};

export const addCommunityReply = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postId = String(id);
  const { userId, username, userImage, message } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!userId || !username || !message) {
    throw new AppError("Reply details are required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  post.replies.push({
    userId: String(userId),
    username: String(username).slice(0, 120),
    userImage: userImage ? String(userImage) : "",
    message: String(message).trim().slice(0, 1000),
  });

  await post.save();

  if (post.authorId !== String(userId)) {
    await createNotificationRecord({
      userId: post.authorId,
      title: "New reply on your farm post",
      message: `${username} replied to your community post.`,
      type: "community-reply",
    });
  }

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(201).json({
    success: true,
    post,
  });
};

export const updateCommunityReply = async (req: Request, res: Response) => {
  const { id, replyId } = req.params;
  const postId = String(id);
  const replyObjectId = String(replyId);
  const { userId, message } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!replyId || !mongoose.Types.ObjectId.isValid(replyObjectId)) {
    throw new AppError("Valid reply id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  if (!message || !String(message).trim()) {
    throw new AppError("Reply message is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const reply = post.replies.id(replyObjectId);

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  if (reply.userId !== String(userId)) {
    throw new AppError("You can edit only your own reply", 403);
  }

  reply.message = String(message).trim().slice(0, 1000);

  await post.save();

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(200).json({
    success: true,
    post,
  });
};

export const deleteCommunityReply = async (req: Request, res: Response) => {
  const { id, replyId } = req.params;
  const postId = String(id);
  const replyObjectId = String(replyId);
  const { userId } = req.body ?? {};

  if (!id || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Valid post id is required", 400);
  }

  if (!replyId || !mongoose.Types.ObjectId.isValid(replyObjectId)) {
    throw new AppError("Valid reply id is required", 400);
  }

  if (!userId) {
    throw new AppError("User id is required", 400);
  }

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const reply = post.replies.id(replyObjectId);

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  if (reply.userId !== String(userId)) {
    throw new AppError("You can delete only your own reply", 403);
  }

  reply.deleteOne();

  await post.save();

  getIO()?.emit("community:post-updated", post.toObject());

  res.status(200).json({
    success: true,
    post,
  });
};
