import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addCommunityReply,
  createCommunityPost,
  deleteCommunityPost,
  deleteCommunityReply,
  getCommunityPosts,
  toggleCommunityLike,
  toggleCommunitySave,
  updateCommunityPost,
  updateCommunityReply,
} from "../controllers/community.controller";

const router = Router();

router.get("/posts", asyncHandler(getCommunityPosts));
router.post("/posts", asyncHandler(createCommunityPost));
router.delete("/posts/:id", asyncHandler(deleteCommunityPost));
router.patch("/posts/:id", asyncHandler(updateCommunityPost));
router.patch("/posts/:id/like", asyncHandler(toggleCommunityLike));
router.patch("/posts/:id/save", asyncHandler(toggleCommunitySave));
router.post("/posts/:id/replies", asyncHandler(addCommunityReply));
router.patch("/posts/:id/replies/:replyId", asyncHandler(updateCommunityReply));
router.delete("/posts/:id/replies/:replyId", asyncHandler(deleteCommunityReply));

export default router;
