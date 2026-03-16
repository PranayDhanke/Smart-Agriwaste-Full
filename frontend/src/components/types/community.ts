export interface CommunityReply {
  _id: string;
  userId: string;
  username: string;
  userImage?: string;
  message: string;
  createdAt: string;
}

export interface CommunityPost {
  _id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  description: string;
  imageUrl?: string;
  category: string;
  likes: string[];
  saves: string[];
  replies: CommunityReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostListResponse {
  success: boolean;
  posts: CommunityPost[];
  pagination: {
    nextCursor: string | undefined;
    limit: number;
    hasNext: boolean;
  };
}
