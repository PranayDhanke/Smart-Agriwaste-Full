import { AppError } from "../utils/AppError";
import Messages from "../models/Messages.model";

export const getMessages = async () => {
  const messages = await Messages.find({})
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();
  if (!messages) {
    throw new AppError("No messages found", 404);
  }
  return messages;
};

export const createMessage = async (data: {
  message: string;
  username?: string;
  userid?: string;
}) => {
  if (!data.message) {
    throw new Error("Message is required");
  }

  return Messages.create({
    message: String(data.message).slice(0, 2000),
    username: data.username ? String(data.username).slice(0, 100) : "anonymous",
    userId: data.userid,
  });
};
