"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  CommunityPost,
  CommunityReply,
} from "@/components/types/community";
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
  ChevronDown,
  Heart,
  ImagePlus,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const categories = [
  {
    id: "all",
    label: "✨ All",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "farm-query",
    label: "🌾 Question",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    id: "crop-care",
    label: "🌿 Crop Care",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "market-help",
    label: "🛒 Marketplace",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "success-story",
    label: "🏆 Success",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  {
    id: "equipment",
    label: "🔧 Equipment",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
];

const postCategories = categories.slice(1); // exclude "all" for post creation

const feedFilters = [
  { id: "all", label: "All" },
  { id: "mine", label: "My Posts" },
  { id: "others", label: "Community" },
];

function relativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getCatMeta(id: string) {
  return categories.find((c) => c.id === id) ?? categories[1];
}

/* ─────────────────────────────────────────────
   COMPOSE BOX
───────────────────────────────────────────── */
function ComposeBox({
  user,
  onPost,
  isSubmitting,
}: {
  user: ReturnType<typeof useUser>["user"];
  onPost: (payload: {
    description: string;
    imageUrl: string;
    category: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("farm-query");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExpanded(true);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async () => {
    if (!description.trim() && !selectedFile)
      return toast.error("Add text or a photo.");
    let imageUrl = "";
    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        imageUrl = await uploadImage(selectedFile, "/community-posts");
      } finally {
        setIsUploadingImage(false);
      }
    }
    await onPost({
      description: description.trim(),
      imageUrl,
      category: selectedCategory,
    });
    setDescription("");
    setSelectedCategory("farm-query");
    clearImage();
    setExpanded(false);
  };

  const busy = isUploadingImage || isSubmitting;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Top Row — avatar + placeholder */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 cursor-text"
        onClick={() => {
          setExpanded(true);
          textareaRef.current?.focus();
        }}
      >
        <Avatar className="h-10 w-10 ring-2 ring-green-200 shrink-0">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-green-700 text-white font-bold">
            {user?.fullName?.charAt(0) ?? "F"}
          </AvatarFallback>
        </Avatar>
        {!expanded ? (
          <span className="flex-1 text-stone-400 text-sm bg-stone-50 rounded-full px-4 py-2.5 border border-stone-200 select-none">
            Share a crop tip, ask a question, list produce…
          </span>
        ) : (
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share a crop tip, ask a question, list produce…"
            className="flex-1 min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 text-[15px] text-stone-800 placeholder:text-stone-400 p-0 bg-transparent"
            autoFocus
          />
        )}
      </div>

      {/* Expanded controls */}
      {expanded && (
        <>
          {/* Image preview */}
          {previewUrl && (
            <div className="relative mx-4 mb-3 rounded-xl overflow-hidden border border-stone-200">
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <Image
                src={previewUrl}
                alt="Preview"
                width={800}
                height={500}
                className="w-full max-h-64 object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {postCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                  selectedCategory === cat.id
                    ? cat.color + " scale-105 shadow-sm"
                    : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <label className="flex items-center gap-2 text-green-700 hover:text-green-900 cursor-pointer text-sm font-semibold transition-colors">
              <ImagePlus className="h-5 w-5" />
              <span>Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={busy}
              />
            </label>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExpanded(false);
                  setDescription("");
                  clearImage();
                }}
                className="text-stone-500 rounded-full"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={busy || (!description.trim() && !selectedFile)}
                className="bg-green-700 hover:bg-green-800 text-white rounded-full px-5 font-semibold shadow-sm"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   POST CARD
───────────────────────────────────────────── */
function PostCard({
  post,
  userId,
  userRole,
  username,
  userImage,
  onLike,
  onSave,
  onReply,
  onEditPost,
  onDeletePost,
  onEditReply,
  onDeleteReply,
}: {
  post: CommunityPost;
  userId?: string;
  userRole?: string;
  username: string;
  userImage?: string;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onReply: (postId: string, message: string) => void;
  onEditPost: (postId: string, description: string, category: string) => void;
  onDeletePost: (postId: string) => void;
  onEditReply: (postId: string, replyId: string, message: string) => void;
  onDeleteReply: (postId: string, replyId: string) => void;
}) {
  const likedByUser = userId ? post.likes.includes(userId) : false;
  const savedByUser = userId ? post.saves.includes(userId) : false;
  const canManage = userId === post.authorId || userRole === "admin";
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editDesc, setEditDesc] = useState(post.description);
  const [editCat, setEditCat] = useState(post.category);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyMsg, setEditReplyMsg] = useState("");

  const catMeta = getCatMeta(post.category);

  return (
    <article className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200">
      {/* ── Post Header ── */}
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-11 w-11 ring-2 ring-green-100 shrink-0">
          <AvatarImage src={post.authorImage} />
          <AvatarFallback className="bg-green-700 text-white font-bold text-base">
            {post.authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[15px] text-stone-900 truncate">
              {post.authorName}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                catMeta.color,
              )}
            >
              {catMeta.label}
            </span>
          </div>
          <span className="text-xs text-stone-400 font-medium">
            {relativeTime(post.createdAt)}
          </span>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl shadow-lg border-stone-200"
            >
              <DropdownMenuItem
                onClick={() => {
                  setIsEditingPost(true);
                  setEditDesc(post.description);
                  setEditCat(post.category);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeletePost(post._id)}
                className="text-red-500 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Post Body ── */}
      <div className="px-4 pb-3">
        {isEditingPost ? (
          <div className="space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              {postCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setEditCat(c.id)}
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all",
                    editCat === c.id
                      ? c.color
                      : "bg-stone-50 text-stone-500 border-stone-200",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="min-h-[90px] text-[15px] rounded-xl border-stone-300 focus-visible:ring-green-600 bg-stone-50"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingPost(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onEditPost(post._id, editDesc, editCat);
                  setIsEditingPost(false);
                }}
                disabled={!editDesc.trim()}
                className="bg-green-700 hover:bg-green-800 text-white rounded-full px-5"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-stone-800 leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        )}
      </div>

      {/* ── Image ── */}
      {post.imageUrl && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-stone-100">
          <Image
            src={post.imageUrl}
            alt="Post"
            width={800}
            height={500}
            className="w-full max-h-[420px] object-cover"
            unoptimized
          />
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-stone-100">
        {/* Like */}
        <button
          onClick={() => onLike(post._id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all active:scale-90",
            likedByUser
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-stone-500 hover:bg-stone-100",
          )}
        >
          <Heart className={cn("h-5 w-5", likedByUser && "fill-red-500")} />
          <span>{post.likes.length}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => {
            setShowReplies(true);
            setShowReplyInput(!showReplyInput);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-stone-500 hover:bg-stone-100 transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.replies.length}</span>
        </button>

        <div className="flex-1" />

        {/* Save */}
        <button
          onClick={() => onSave(post._id)}
          className={cn(
            "p-2 rounded-full transition-all active:scale-90",
            savedByUser
              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
              : "text-stone-400 hover:bg-stone-100",
          )}
        >
          <Bookmark
            className={cn("h-5 w-5", savedByUser && "fill-amber-500")}
          />
        </button>
      </div>

      {/* ── Replies ── */}
      {(showReplies || post.replies.length > 0) && (
        <div className="border-t border-stone-100 bg-stone-50/60">
          {/* Show/hide toggle */}
          {post.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors w-full"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showReplies && "rotate-180",
                )}
              />
              {showReplies
                ? "Hide"
                : `View ${post.replies.length} ${post.replies.length === 1 ? "reply" : "replies"}`}
            </button>
          )}

          {showReplies && (
            <div className="px-4 pb-3 space-y-3">
              {post.replies.map((reply: CommunityReply) => (
                <div key={reply._id} className="flex gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarImage src={reply.userImage} />
                    <AvatarFallback className="bg-stone-300 text-stone-700 font-bold text-xs">
                      {reply.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 border border-stone-200 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-stone-800">
                          {reply.username}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400">
                            {relativeTime(reply.createdAt)}
                          </span>
                          {userId === reply.userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-stone-400 hover:text-stone-600 p-0.5 rounded">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-36 rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingReplyId(reply._id);
                                    setEditReplyMsg(reply.message);
                                  }}
                                >
                                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onDeleteReply(post._id, reply._id)
                                  }
                                  className="text-red-500"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      {editingReplyId === reply._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editReplyMsg}
                            onChange={(e) => setEditReplyMsg(e.target.value)}
                            className="min-h-[60px] text-sm rounded-lg border-stone-300 focus-visible:ring-green-600 bg-stone-50"
                          />
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingReplyId(null)}
                              className="h-7 px-3 rounded-full text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                onEditReply(post._id, reply._id, editReplyMsg);
                                setEditingReplyId(null);
                              }}
                              className="h-7 px-3 rounded-full text-xs bg-green-700 hover:bg-green-800 text-white"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-700 whitespace-pre-wrap">
                          {reply.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          {showReplyInput && (
            <div className="flex items-end gap-2.5 px-4 pb-4 pt-1">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userImage} />
                <AvatarFallback className="bg-green-700 text-white font-bold text-xs">
                  {username?.charAt(0) ?? "F"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-end gap-2 bg-white border border-stone-300 rounded-2xl pl-3 pr-2 py-2 shadow-sm focus-within:border-green-400 transition-colors">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="flex-1 min-h-[36px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-sm text-stone-800 placeholder:text-stone-400 p-0 bg-transparent"
                  rows={1}
                />
                <button
                  onClick={() => {
                    onReply(post._id, replyText);
                    setReplyText("");
                    setShowReplyInput(false);
                  }}
                  disabled={!replyText.trim()}
                  className="shrink-0 p-1.5 rounded-full bg-green-700 text-white disabled:opacity-40 hover:bg-green-800 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function CommunityFeed() {
  const { user } = useUser();
  const userRole =
    typeof user?.unsafeMetadata?.role === "string"
      ? user.unsafeMetadata.role
      : undefined;
  const [feedFilter, setFeedFilter] = useState<"all" | "mine" | "others">(
    "all",
  );
  const [catFilter, setCatFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "post"; postId: string }
    | { type: "reply"; postId: string; replyId: string }
    | null
  >(null);

  const { data, isLoading, refetch } = useGetCommunityPostsQuery({ limit: 20 });
  const [createPost, { isLoading: isCreatingPost }] =
    useCreateCommunityPostMutation();
  const [updatePost] = useUpdateCommunityPostMutation();
  const [deletePost, { isLoading: isDeletingPost }] =
    useDeleteCommunityPostMutation();
  const [toggleLike] = useToggleCommunityLikeMutation();
  const [toggleSave] = useToggleCommunitySaveMutation();
  const [addReply] = useAddCommunityReplyMutation();
  const [updateReply] = useUpdateCommunityReplyMutation();
  const [deleteReply, { isLoading: isDeletingReply }] =
    useDeleteCommunityReplyMutation();

  useEffect(() => {
    const socket = connectSocketForUser(user?.id);
    const refresh = () => refetch();
    socket.on("community:post-created", refresh);
    socket.on("community:post-updated", refresh);
    socket.on("community:post-deleted", refresh);
    return () => {
      socket.off("community:post-created", refresh);
      socket.off("community:post-updated", refresh);
      socket.off("community:post-deleted", refresh);
    };
  }, [refetch, user?.id]);

  const signedInName = useMemo(
    () => user?.fullName || user?.username || "Farmer",
    [user],
  );

  const posts = useMemo(() => data?.posts ?? [], [data?.posts]);
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (feedFilter === "mine")
      list = list.filter((p) => p.authorId === user?.id);
    else if (feedFilter === "others")
      list = list.filter((p) => p.authorId !== user?.id);
    if (catFilter !== "all")
      list = list.filter((p) => p.category === catFilter);
    return list;
  }, [feedFilter, catFilter, posts, user?.id]);

  const handleCreatePost = async ({
    description,
    imageUrl,
    category,
  }: {
    description: string;
    imageUrl: string;
    category: string;
  }): Promise<void> => {
    if (!user) {
      toast.error("Sign in to post.");
      return;
    }

    try {
      await createPost({
        authorId: user.id,
        authorName: signedInName,
        authorImage: user.imageUrl,
        description,
        imageUrl,
        category,
      }).unwrap();

      await refetch();

      toast.success("Posted! 🌾");

      return; // ✅ important
    } catch {
      toast.error("Could not publish post.");
      return; // ✅ important
    }
  };
  const handleLike = async (postId: string) => {
    if (!user) return toast.error("Sign in to like.");
    try {
      await toggleLike({
        postId,
        userId: user.id,
        username: signedInName,
      }).unwrap();
    } catch {
      toast.error("Could not update like.");
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) return toast.error("Sign in to save.");
    try {
      await toggleSave({ postId, userId: user.id }).unwrap();
    } catch {
      toast.error("Could not save.");
    }
  };

  const handleReply = async (postId: string, message: string) => {
    if (!user) return toast.error("Sign in to reply.");
    if (!message.trim()) return;
    try {
      await addReply({
        postId,
        userId: user.id,
        username: signedInName,
        userImage: user.imageUrl,
        message,
      }).unwrap();
      toast.success("Reply added!");
    } catch {
      toast.error("Could not add reply.");
    }
  };

  const handleEditPost = async (
    postId: string,
    description: string,
    category: string,
  ) => {
    if (!user) return;
    try {
      await updatePost({
        postId,
        userId: user.id,
        description,
        category,
      }).unwrap();
      toast.success("Post updated!");
    } catch {
      toast.error("Could not update post.");
    }
  };

  const handleEditReply = async (
    postId: string,
    replyId: string,
    message: string,
  ) => {
    if (!user) return;
    try {
      await updateReply({ postId, replyId, userId: user.id, message }).unwrap();
      toast.success("Reply updated!");
    } catch {
      toast.error("Could not update reply.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;
    try {
      if (deleteTarget.type === "post") {
        await deletePost({
          postId: deleteTarget.postId,
          userId: user.id,
        }).unwrap();
        toast.success("Post deleted.");
      } else {
        await deleteReply({
          postId: deleteTarget.postId,
          replyId: deleteTarget.replyId,
          userId: user.id,
        }).unwrap();
        toast.success("Reply deleted.");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete.");
    }
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="mx-auto max-w-2xl px-4">
          {/* Title row */}
          <div className="flex items-center gap-2 py-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-8 w-8 bg-green-700 rounded-xl flex items-center justify-center shadow-sm">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-[17px] text-stone-900 tracking-tight">
                Community
              </span>
            </div>
            {/* Feed filter pills */}
            <div className="flex gap-1">
              {feedFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeedFilter(f.id as "all" | "mine" | "others")}
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-full transition-all",
                    feedFilter === f.id
                      ? "bg-green-700 text-white shadow-sm"
                      : "text-stone-500 hover:bg-stone-100",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className={cn(
                  "shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all",
                  catFilter === cat.id
                    ? cat.color + " shadow-sm scale-105"
                    : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Feed ── */}
      <div className="mx-auto max-w-2xl px-4 py-5 space-y-4">
        {/* Compose */}
        <ComposeBox
          user={user}
          onPost={handleCreatePost}
          isSubmitting={isCreatingPost}
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            Feed
          </span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-stone-500 font-medium">
              Loading community…
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-stone-200">
            <Sprout className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="font-bold text-stone-600 text-base">
              Nothing here yet
            </p>
            <p className="text-stone-400 text-sm mt-1">
              Be the first to post in this category!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              userId={user?.id}
              userRole={userRole}
              username={signedInName}
              userImage={user?.imageUrl}
              onLike={handleLike}
              onSave={handleSave}
              onReply={handleReply}
              onEditPost={handleEditPost}
              onDeletePost={(postId: string) =>
                setDeleteTarget({ type: "post", postId })
              }
              onEditReply={handleEditReply}
              onDeleteReply={(postId: string, replyId: string) =>
                setDeleteTarget({ type: "reply", postId, replyId })
              }
            />
          ))
        )}
      </div>

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {deleteTarget?.type === "post"
                ? "Delete this post?"
                : "Delete this reply?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-stone-500">
              This is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-full"
              disabled={isDeletingPost || isDeletingReply}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingPost || isDeletingReply}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
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
