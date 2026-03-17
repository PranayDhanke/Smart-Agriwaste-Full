"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/utils/imagekit";
import { connectSocketForUser } from "@/lib/socket";
import {
  useAddCommunityReplyMutation,
  useCreateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useDeleteCommunityReplyMutation,
  useGetCommunityPostsQuery,
  useToggleCommunityLikeMutation,
  useToggleCommunitySaveMutation,
  useUpdateCommunityPostMutation,
  useUpdateCommunityReplyMutation,
} from "@/redux/api/communityApi";
import {
  Bookmark,
  Camera,
  Heart,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Tractor,
  Trash2,
  X
} from "lucide-react";

const categories = [
  { id: "farm-query", label: "Question" },
  { id: "crop-care", label: "Crop Care" },
  { id: "market-help", label: "Market/Selling" },
  { id: "success-story", label: "Harvest/Success" },
  { id: "equipment", label: "Equipment" },
];

export default function CommunityFeed() {
  const { user } = useUser();
  const [feedFilter, setFeedFilter] = useState<"all" | "mine" | "others">("all");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("farm-query");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postEditDescription, setPostEditDescription] = useState("");
  const [postEditCategory, setPostEditCategory] = useState("farm-query");
  const [editingReplyKey, setEditingReplyKey] = useState<string | null>(null);
  const [replyEditMessage, setReplyEditMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "post"; postId: string }
    | { type: "reply"; postId: string; replyId: string }
    | null
  >(null);

  const { data, isLoading, refetch } = useGetCommunityPostsQuery({ limit: 20 });
  const [createPost, { isLoading: isCreatingPost }] = useCreateCommunityPostMutation();
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdateCommunityPostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeleteCommunityPostMutation();
  const [toggleLike] = useToggleCommunityLikeMutation();
  const [toggleSave] = useToggleCommunitySaveMutation();
  const [addReply, { isLoading: isReplying }] = useAddCommunityReplyMutation();
  const [updateReply, { isLoading: isUpdatingReply }] = useUpdateCommunityReplyMutation();
  const [deleteReply, { isLoading: isDeletingReply }] = useDeleteCommunityReplyMutation();

  useEffect(() => {
    const socket = connectSocketForUser(user?.id);
    const refreshFeed = () => refetch();

    socket.on("community:post-created", refreshFeed);
    socket.on("community:post-updated", refreshFeed);
    socket.on("community:post-deleted", refreshFeed);

    return () => {
      socket.off("community:post-created", refreshFeed);
      socket.off("community:post-updated", refreshFeed);
      socket.off("community:post-deleted", refreshFeed);
    };
  }, [refetch, user?.id]);

  const signedInName = useMemo(
    () => user?.fullName || user?.username || "Farmer",
    [user],
  );

  const posts = useMemo(() => data?.posts ?? [], [data?.posts]);
  const filteredPosts = useMemo(() => {
    if (feedFilter === "all") {
      return posts;
    }

    if (!user) {
      return feedFilter === "others" ? posts : [];
    }

    return posts.filter((post) =>
      feedFilter === "mine" ? post.authorId === user.id : post.authorId !== user.id,
    );
  }, [feedFilter, posts, user]);
  const isSubmittingPost = isUploadingImage || isCreatingPost;

  const emptyState = useMemo(() => {
    if (posts.length === 0) {
      return {
        title: "The board is empty.",
        description: "Be the first to share an update or ask a question.",
      };
    }

    if (feedFilter === "mine") {
      return user
        ? {
            title: "You have not posted yet.",
            description: "Create your first post to see it here.",
          }
        : {
            title: "Sign in to view your posts.",
            description: "Your own community posts will appear here after you sign in.",
          };
    }

    if (feedFilter === "others") {
      return {
        title: "No posts from other members yet.",
        description: "Check back later for updates from the community.",
      };
    }

    return {
      title: "No posts found.",
      description: "Try a different filter or create a new post.",
    };
  }, [feedFilter, posts.length, user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleCreatePost = async () => {
    if (isSubmittingPost) return;
    if (!user) return toast.error("Sign in to post.");
    if (!description.trim() && !selectedFile) return toast.error("Add text or a photo.");

    try {
      let imageUrl = "";
      if (selectedFile) {
        setIsUploadingImage(true);
        imageUrl = await uploadImage(selectedFile, "/community-posts");
        setIsUploadingImage(false);
      }

      await createPost({
        authorId: user.id,
        authorName: signedInName,
        authorImage: user.imageUrl,
        description: description.trim(),
        imageUrl,
        category: selectedCategory,
      }).unwrap();

      await refetch();
      setDescription("");
      setSelectedCategory("farm-query");
      clearImage();
      toast.success("Post published!");
    } catch {
      toast.error("Could not publish post.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return toast.error("Sign in to like posts.");
    try {
      await toggleLike({ postId, userId: user.id, username: signedInName }).unwrap();
    } catch {
      toast.error("Could not update like.");
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!user) return toast.error("Sign in to save posts.");
    try {
      await toggleSave({ postId, userId: user.id }).unwrap();
    } catch {
      toast.error("Could not save post.");
    }
  };

  const handleReply = async (postId: string) => {
    if (!user) return toast.error("Sign in to reply.");
    const message = replyDrafts[postId]?.trim();
    if (!message) return toast.error("Write a reply first.");

    try {
      await addReply({
        postId,
        userId: user.id,
        username: signedInName,
        userImage: user.imageUrl,
        message,
      }).unwrap();

      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
      setActiveReplyId(null);
      toast.success("Reply added!");
    } catch {
      toast.error("Could not add reply.");
    }
  };

  const handleStartPostEdit = (
    postId: string,
    currentDescription: string,
    currentCategory: string,
  ) => {
    setEditingPostId(postId);
    setPostEditDescription(currentDescription);
    setPostEditCategory(currentCategory);
  };

  const handleUpdatePost = async (postId: string) => {
    if (!user) return toast.error("Sign in to edit posts.");
    if (!postEditDescription.trim()) return toast.error("Post text cannot be empty.");

    try {
      await updatePost({
        postId,
        userId: user.id,
        description: postEditDescription.trim(),
        category: postEditCategory,
      }).unwrap();

      setEditingPostId(null);
      toast.success("Post updated!");
    } catch {
      toast.error("Could not update post.");
    }
  };

  const handleStartReplyEdit = (postId: string, replyId: string, message: string) => {
    setActiveReplyId(postId);
    setEditingReplyKey(`${postId}:${replyId}`);
    setReplyEditMessage(message);
  };

  const handleUpdateReply = async (postId: string, replyId: string) => {
    if (!user) return toast.error("Sign in to edit replies.");
    if (!replyEditMessage.trim()) return toast.error("Reply cannot be empty.");

    try {
      await updateReply({
        postId,
        replyId, 
        userId: user.id,
        message: replyEditMessage.trim(),
      }).unwrap();

      setEditingReplyKey(null);
      setReplyEditMessage("");
      toast.success("Reply updated!");
    } catch {
      toast.error("Could not update reply.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;

    try {
      if (deleteTarget.type === "post") {
        await deletePost({ postId: deleteTarget.postId, userId: user.id }).unwrap();
        if (editingPostId === deleteTarget.postId) {
          setEditingPostId(null);
        }
        toast.success("Post deleted.");
      } else {
        await deleteReply({
          postId: deleteTarget.postId,
          replyId: deleteTarget.replyId,
          userId: user.id,
        }).unwrap();
        if (editingReplyKey === `${deleteTarget.postId}:${deleteTarget.replyId}`) {
          setEditingReplyKey(null);
          setReplyEditMessage("");
        }
        toast.success("Reply deleted.");
      }

      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete item.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  return (
    <main className="min-h-screen bg-stone-100 py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-green-800 text-white p-6 rounded-2xl shadow-md">
          <Tractor className="h-10 w-10 text-green-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Community Board</h1>
            <p className="text-green-100 font-medium mt-1">Connect, ask, and trade with local farmers & buyers.</p>
          </div>
        </div>

        {/* Post Creation Box */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-green-100 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Create a New Post</h2>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    selectedCategory === cat.id
                      ? "bg-green-700 text-white shadow-md ring-2 ring-green-700 ring-offset-1"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your crop issue, list your produce for sale, or ask a question..."
              className="min-h-[120px] text-lg p-4 bg-stone-50 border-stone-300 rounded-xl focus-visible:ring-green-600"
            />

            {previewUrl && (
              <div className="relative rounded-xl overflow-hidden border-2 border-stone-200">
                <Button 
                  variant="destructive" 
                  className="absolute top-3 right-3 h-10 w-10 rounded-full shadow-lg"
                  onClick={clearImage}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="w-full max-h-[400px] object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <label className="flex-1 flex justify-center items-center gap-2 cursor-pointer bg-green-50 text-green-800 border-2 border-green-200 rounded-xl py-3 px-4 font-bold hover:bg-green-100 transition">
                <Camera className="h-6 w-6" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmittingPost}
                />
              </label>
              <Button
                onClick={handleCreatePost}
                disabled={isSubmittingPost}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-6 text-lg font-bold shadow-md"
              >
                {isSubmittingPost ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Publish Post"}
              </Button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all" as const, label: "All Posts" },
                { id: "mine" as const, label: "My Posts" },
                { id: "others" as const, label: "Other Posts" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFeedFilter(option.id)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    feedFilter === option.id
                      ? "bg-green-700 text-white shadow-md ring-2 ring-green-700 ring-offset-1"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-green-700 mx-auto" />
              <p className="mt-4 text-stone-500 font-medium">Loading board...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-2xl border-2 border-dashed border-stone-300">
              <p className="text-xl font-bold text-stone-700">{emptyState.title}</p>
              <p className="text-stone-500 mt-2">{emptyState.description}</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const likedByUser = user ? post.likes.includes(user.id) : false;
              const savedByUser = user ? post.saves.includes(user.id) : false;
              const canManagePost = user?.id === post.authorId;
              const isEditingPost = editingPostId === post._id;
              const catLabel = categories.find(c => c.id === post.category)?.label || post.category;

              return (
                <article key={post._id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  
                  {/* Post Header */}
                  <div className="p-5 flex gap-4 items-center bg-stone-50/50">
                    <Avatar className="h-14 w-14 border-2 border-green-200">
                      <AvatarImage src={post.authorImage} />
                      <AvatarFallback className="bg-green-100 text-green-800 font-bold text-xl">
                        {post.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{post.authorName}</h3>
                      <p className="text-sm text-gray-500 font-medium">{formatDate(post.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-sm px-3 py-1 font-bold border-0">
                        {catLabel}
                      </Badge>
                      {canManagePost && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-full text-stone-500 hover:bg-stone-200"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleStartPostEdit(post._id, post.description, post.category)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit post
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget({ type: "post", postId: post._id })}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Image (Edge to Edge) */}
                  {post.imageUrl && (
                    <div className="bg-stone-100 border-y border-stone-100">
                      <Image
                        src={post.imageUrl}
                        alt="Post attachment"
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-[500px] object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="p-6">
                    {isEditingPost ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setPostEditCategory(cat.id)}
                              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                                postEditCategory === cat.id
                                  ? "bg-green-700 text-white"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={postEditDescription}
                          onChange={(e) => setPostEditDescription(e.target.value)}
                          className="min-h-[120px] bg-stone-50 border-stone-300 rounded-xl focus-visible:ring-green-600"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setEditingPostId(null)}
                            disabled={isUpdatingPost}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleUpdatePost(post._id)}
                            disabled={isUpdatingPost || !postEditDescription.trim()}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            {isUpdatingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                        {post.description}
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
                    <Button
                      variant={likedByUser ? "default" : "outline"}
                      onClick={() => handleToggleLike(post._id)}
                      className={`flex-1 rounded-xl font-bold py-6 ${likedByUser ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                    >
                      <Heart className={`mr-2 h-5 w-5 ${likedByUser ? "fill-current" : ""}`} />
                      {post.likes.length} Helpful
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveReplyId(activeReplyId === post._id ? null : post._id)}
                      className="flex-1 rounded-xl font-bold py-6 text-gray-600 hover:bg-gray-50 border-gray-200"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {post.replies.length} Replies
                    </Button>

                    <Button
                      variant={savedByUser ? "default" : "outline"}
                      onClick={() => handleToggleSave(post._id)}
                      className={`flex-none w-16 rounded-xl ${savedByUser ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-gray-600 border-gray-200'}`}
                    >
                      <Bookmark className={`h-5 w-5 ${savedByUser ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {/* Replies Area */}
                  {(post.replies.length > 0 || activeReplyId === post._id) && (
                    <div className="bg-stone-50 border-t border-stone-200 p-5 space-y-5">
                      {/* List Replies */}
                      {post.replies.map((reply) => (
                        <div key={reply._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{reply.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">{formatDate(reply.createdAt)}</span>
                              {user?.id === reply.userId && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-stone-500 hover:bg-stone-100"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => handleStartReplyEdit(post._id, reply._id, reply.message)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit reply
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setDeleteTarget({ type: "reply", postId: post._id, replyId: reply._id })}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete reply
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          {editingReplyKey === `${post._id}:${reply._id}` ? (
                            <div className="space-y-3">
                              <Textarea
                                value={replyEditMessage}
                                onChange={(e) => setReplyEditMessage(e.target.value)}
                                className="min-h-[90px] bg-stone-50 border-stone-300 rounded-xl focus-visible:ring-green-600"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingReplyKey(null);
                                    setReplyEditMessage("");
                                  }}
                                  disabled={isUpdatingReply}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleUpdateReply(post._id, reply._id)}
                                  disabled={isUpdatingReply || !replyEditMessage.trim()}
                                  className="bg-green-700 hover:bg-green-800 text-white"
                                >
                                  {isUpdatingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save reply"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                          )}
                        </div>
                      ))}

                      {/* Reply Input Box */}
                      {activeReplyId === post._id && (
                        <div className="flex flex-col gap-3 pt-2">
                          <Textarea
                            value={replyDrafts[post._id] ?? ""}
                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [post._id]: e.target.value }))}
                            placeholder="Write your advice or answer here..."
                            className="min-h-[80px] bg-white border-stone-300 rounded-xl focus-visible:ring-green-600 p-3"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setActiveReplyId(null)} className="font-bold">
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleReply(post._id)}
                              disabled={isReplying || !replyDrafts[post._id]?.trim()}
                              className="bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl px-6"
                            >
                              {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Reply"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "post" ? "Delete post?" : "Delete reply?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "post"
                ? "This will permanently remove your post from the community board."
                : "This will permanently remove your reply from the discussion."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={isDeletingPost || isDeletingReply}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingPost || isDeletingReply}
            >
              {isDeletingPost || isDeletingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
