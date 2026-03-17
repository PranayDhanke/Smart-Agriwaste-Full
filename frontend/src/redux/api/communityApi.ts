import {
  CommunityPost,
  CommunityPostListResponse,
} from "@/components/types/community";
import { baseApi } from "./baseApi";

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityPosts: builder.query<
      CommunityPostListResponse,
      { cursor?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: "/community/posts",
        params: {
          cursor: params?.cursor,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map((post) => ({
                type: "Community" as const,
                id: post._id,
              })),
              { type: "Community", id: "LIST" },
            ]
          : [{ type: "Community", id: "LIST" }],
    }),
    createCommunityPost: builder.mutation<
      { success: boolean; post: CommunityPost },
      {
        authorId: string;
        authorName: string;
        authorImage?: string;
        description: string;
        imageUrl?: string;
        category?: string;
      }
    >({
      query: (body) => ({
        url: "/community/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
    deleteCommunityPost: builder.mutation<
      { success: boolean; message: string },
      { postId: string; userId: string }
    >({
      query: ({ postId, userId }) => ({
        url: `/community/posts/${postId}`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    updateCommunityPost: builder.mutation<
      { success: boolean; post: CommunityPost },
      { postId: string; userId: string; description: string; category?: string }
    >({
      query: ({ postId, ...body }) => ({
        url: `/community/posts/${postId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    toggleCommunityLike: builder.mutation<
      { success: boolean; liked: boolean; post: CommunityPost },
      { postId: string; userId: string; username: string }
    >({
      query: ({ postId, ...body }) => ({
        url: `/community/posts/${postId}/like`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    toggleCommunitySave: builder.mutation<
      { success: boolean; saved: boolean; post: CommunityPost },
      { postId: string; userId: string }
    >({
      query: ({ postId, ...body }) => ({
        url: `/community/posts/${postId}/save`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    addCommunityReply: builder.mutation<
      { success: boolean; post: CommunityPost },
      {
        postId: string;
        userId: string;
        username: string;
        userImage?: string;
        message: string;
      }
    >({
      query: ({ postId, ...body }) => ({
        url: `/community/posts/${postId}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    updateCommunityReply: builder.mutation<
      { success: boolean; post: CommunityPost },
      { postId: string; replyId: string; userId: string; message: string }
    >({
      query: ({ postId, replyId, ...body }) => ({
        url: `/community/posts/${postId}/replies/${replyId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
    deleteCommunityReply: builder.mutation<
      { success: boolean; post: CommunityPost },
      { postId: string; replyId: string; userId: string }
    >({
      query: ({ postId, replyId, ...body }) => ({
        url: `/community/posts/${postId}/replies/${replyId}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Community", id: arg.postId },
        { type: "Community", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCommunityReplyMutation,
  useCreateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useDeleteCommunityReplyMutation,
  useGetCommunityPostsQuery,
  useToggleCommunityLikeMutation,
  useToggleCommunitySaveMutation,
  useUpdateCommunityPostMutation,
  useUpdateCommunityReplyMutation,
} = communityApi;
