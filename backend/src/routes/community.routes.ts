import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addCommunityReply,
  createCommunityPost,
  deleteCommunityPost,
  getCommunityPosts,
  toggleCommunityLike,
  toggleCommunitySave,
} from "../controllers/community.controller";

const router = Router();

router.get("/posts", asyncHandler(getCommunityPosts));
router.post("/posts", asyncHandler(createCommunityPost));
router.delete("/posts/:id", asyncHandler(deleteCommunityPost));
router.patch("/posts/:id/like", asyncHandler(toggleCommunityLike));
router.patch("/posts/:id/save", asyncHandler(toggleCommunitySave));
router.post("/posts/:id/replies", asyncHandler(addCommunityReply));

export default router;
