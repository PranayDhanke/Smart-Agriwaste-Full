"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/utils/imagekit";
import { connectSocketForUser } from "@/lib/socket";
import {
  useAddCommunityReplyMutation,
  useCreateCommunityPostMutation,
  useGetCommunityPostsQuery,
  useToggleCommunityLikeMutation,
  useToggleCommunitySaveMutation,
} from "@/redux/api/communityApi";
import {
  Bookmark,
  Camera,
  Heart,
  Loader2,
  MessageSquare,
  Send,
  Tractor,
  X
} from "lucide-react";

const categoryDefinitions = [
  { id: "farm-query", labelKey: "farmQuery" },
  { id: "crop-care", labelKey: "cropCare" },
  { id: "market-help", labelKey: "marketHelp" },
  { id: "success-story", labelKey: "successStory" },
  { id: "equipment", labelKey: "equipment" },
];

export default function CommunityFeed() {
  const { user } = useUser();
  const locale = useLocale();
  const t = useTranslations("community.board");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("farm-query");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetCommunityPostsQuery({ limit: 20 });
  const [createPost, { isLoading: isCreatingPost }] = useCreateCommunityPostMutation();
  const [toggleLike] = useToggleCommunityLikeMutation();
  const [toggleSave] = useToggleCommunitySaveMutation();
  const [addReply, { isLoading: isReplying }] = useAddCommunityReplyMutation();

  useEffect(() => {
    const socket = connectSocketForUser(user?.id);
    const refreshFeed = () => refetch();

    socket.on("community:post-created", refreshFeed);
    socket.on("community:post-updated", refreshFeed);

    return () => {
      socket.off("community:post-created", refreshFeed);
      socket.off("community:post-updated", refreshFeed);
    };
  }, [refetch, user?.id]);

  const signedInName = useMemo(
    () => user?.fullName || user?.username || "Farmer",
    [user],
  );

  const categories = useMemo(
    () =>
      categoryDefinitions.map((cat) => ({
        ...cat,
        label: t(`categories.${cat.labelKey}`),
      })),
    [t],
  );

  const posts = data?.posts ?? [];
  const isSubmittingPost = isUploadingImage || isCreatingPost;

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
    if (!user) return toast.error(t("toasts.signInToPost"));
    if (!description.trim() && !selectedFile) return toast.error(t("toasts.addTextOrPhoto"));

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
      toast.success(t("toasts.postPublished"));
    } catch (error) {
      toast.error(t("toasts.couldNotPublish"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return toast.error(t("toasts.signInToLike"));
    try {
      await toggleLike({ postId, userId: user.id, username: signedInName }).unwrap();
    } catch {
      toast.error(t("toasts.couldNotUpdateLike"));
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!user) return toast.error(t("toasts.signInToSave"));
    try {
      await toggleSave({ postId, userId: user.id }).unwrap();
    } catch {
      toast.error(t("toasts.couldNotSave"));
    }
  };

  const handleReply = async (postId: string) => {
    if (!user) return toast.error(t("toasts.signInToReply"));
    const message = replyDrafts[postId]?.trim();
    if (!message) return toast.error(t("toasts.writeReplyFirst"));

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
      toast.success(t("toasts.replyAdded"));
    } catch {
      toast.error(t("toasts.couldNotAddReply"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-stone-100 py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-green-800 text-white p-6 rounded-2xl shadow-md">
          <Tractor className="h-10 w-10 text-green-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-green-100 font-medium mt-1">{t("subtitle")}</p>
          </div>
        </div>

        {/* Post Creation Box */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-green-100 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">{t("createPost")}</h2>
            
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
              placeholder={t("placeholders.description")}
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
                  alt={t("post.previewAlt")}
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
                <span>{t("buttons.uploadPhoto")}</span>
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
                {isSubmittingPost ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : t("buttons.publish")}
              </Button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-green-700 mx-auto" />
              <p className="mt-4 text-stone-500 font-medium">{t("status.loading")}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-2xl border-2 border-dashed border-stone-300">
              <p className="text-xl font-bold text-stone-700">{t("status.emptyTitle")}</p>
              <p className="text-stone-500 mt-2">{t("status.emptyDescription")}</p>
            </div>
          ) : (
            posts.map((post) => {
              const likedByUser = user ? post.likes.includes(user.id) : false;
              const savedByUser = user ? post.saves.includes(user.id) : false;
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
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-sm px-3 py-1 font-bold border-0">
                      {catLabel}
                    </Badge>
                  </div>

                  {/* Image (Edge to Edge) */}
                  {post.imageUrl && (
                    <div className="bg-stone-100 border-y border-stone-100">
                      <Image
                        src={post.imageUrl}
                        alt={t("post.attachmentAlt")}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-[500px] object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="p-6">
                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
                    <Button
                      variant={likedByUser ? "default" : "outline"}
                      onClick={() => handleToggleLike(post._id)}
                      className={`flex-1 rounded-xl font-bold py-6 ${likedByUser ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                    >
                      <Heart className={`mr-2 h-5 w-5 ${likedByUser ? "fill-current" : ""}`} />
                      {post.likes.length} {t("actions.helpful")}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveReplyId(activeReplyId === post._id ? null : post._id)}
                      className="flex-1 rounded-xl font-bold py-6 text-gray-600 hover:bg-gray-50 border-gray-200"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {post.replies.length} {t("actions.replies")}
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
                            <span className="font-bold text-gray-900">{reply.username}</span>
                            <span className="text-xs text-gray-500 font-medium">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-gray-700">{reply.message}</p>
                        </div>
                      ))}

                      {/* Reply Input Box */}
                      {activeReplyId === post._id && (
                        <div className="flex flex-col gap-3 pt-2">
                          <Textarea
                            value={replyDrafts[post._id] ?? ""}
                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [post._id]: e.target.value }))}
                            placeholder={t("placeholders.reply")}
                            className="min-h-[80px] bg-white border-stone-300 rounded-xl focus-visible:ring-green-600 p-3"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setActiveReplyId(null)} className="font-bold">
                              {t("buttons.cancel")}
                            </Button>
                            <Button 
                              onClick={() => handleReply(post._id)}
                              disabled={isReplying || !replyDrafts[post._id]?.trim()}
                              className="bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl px-6"
                            >
                              {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : t("buttons.postReply")}
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
    </main>
  );
}