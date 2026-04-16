import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Check,
  Circle,
  Trash2,
  Send,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type { Comment } from "@shared/schema";

const PAGE_NAMES: Record<string, string> = {
  "/assurance": "Assurance",
  "/new-retirement-funds": "Retirement Funds",
  "/defined-benefit-funds": "Defined Benefit Funds",
  "/voluntary-investments": "Voluntary Investments",
  "/assets": "Assets",
  "/liabilities": "Liabilities",
  "/income-needs": "Income Needs",
  "/income-provisions": "Income Provisions",
  "/lump-sum-bequests": "Lump Sum Bequests",
  "/residue": "Residue",
  "/additional-estate-duty-items": "Additional Estate Duty Items",
  "/client-details": "Client Details",
};

function getPageName(path: string): string {
  return PAGE_NAMES[path] || path.split("/").filter(Boolean).pop() || path;
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CommentsPanel() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState(
    () => localStorage.getItem("comments-author") || ""
  );
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const queryKey = `/api/comments?page=${encodeURIComponent(location)}`;

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [queryKey],
    enabled: true,
  });

  const openComments = comments.filter((c) => c.status === "open");
  const doneComments = comments.filter((c) => c.status === "done");
  const openCount = openComments.length;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }, [queryKey]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      author: string;
      content: string;
      image?: string | null;
    }) => {
      await apiRequest("POST", "/api/comments", {
        page: location,
        author: data.author,
        content: data.content,
        image: data.image || null,
        status: "open",
      });
    },
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "open" | "done";
    }) => {
      await apiRequest("PATCH", `/api/comments/${id}`, { status });
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/comments/${id}`);
    },
    onSuccess: invalidate,
  });

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const base64 = await fileToBase64(file);
          setImagePreview(base64);
        }
        return;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imagePreview) || !author.trim()) return;
    localStorage.setItem("comments-author", author);
    createMutation.mutate({
      author,
      content: content || (imagePreview ? "(screenshot)" : ""),
      image: imagePreview,
    });
    setContent("");
    setImagePreview(null);
  };

  return (
    <>
      {/* Floating button — hidden when panel is open */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 right-6 z-[51] flex h-12 w-12 items-center justify-center rounded-full bg-[#016991] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#015577] active:scale-95"
          title="Comments"
        >
          <MessageSquare className="h-5 w-5" />
          {openCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97415] px-1 text-[11px] font-semibold text-white">
              {openCount}
            </span>
          )}
        </button>
      )}

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#016991]" />
              {getPageName(location)}
            </SheetTitle>
            <SheetDescription>
              {openCount} open comment{openCount !== 1 ? "s" : ""}
              {doneComments.length > 0 && ` · ${doneComments.length} done`}
            </SheetDescription>
          </SheetHeader>

          {/* Comments list */}
          <ScrollArea className="-mx-6 flex-1 px-6">
            <div className="space-y-3 pb-4">
              {openComments.length === 0 && doneComments.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No comments on this page yet.
                </p>
              )}

              {openComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onToggle={() =>
                    toggleMutation.mutate({ id: comment.id, status: "done" })
                  }
                  onDelete={() => deleteMutation.mutate(comment.id)}
                  onImageClick={setLightboxSrc}
                />
              ))}

              {doneComments.length > 0 && openComments.length > 0 && (
                <div className="border-t pt-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Done
                  </p>
                </div>
              )}

              {doneComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isDone
                  onToggle={() =>
                    toggleMutation.mutate({ id: comment.id, status: "open" })
                  }
                  onDelete={() => deleteMutation.mutate(comment.id)}
                  onImageClick={setLightboxSrc}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Add comment form */}
          <form
            onSubmit={handleSubmit}
            className="-mx-6 border-t bg-muted/30 px-6 pt-4"
          >
            <Input
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mb-2 h-8 text-sm"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mb-2 inline-block">
                <img
                  src={imagePreview}
                  alt="Screenshot preview"
                  className="max-h-32 rounded border object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Add a comment… (Ctrl+V to paste screenshot)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                className="min-h-[60px] flex-1 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  (!content.trim() && !imagePreview) ||
                  !author.trim() ||
                  createMutation.isPending
                }
                className="h-[60px] w-10 shrink-0 bg-[#016991] hover:bg-[#015577]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 pb-2 text-[11px] text-muted-foreground">
              Ctrl+Enter to submit · Ctrl+V to paste screenshot
            </p>
          </form>
        </SheetContent>
      </Sheet>

      {/* Lightbox for full-size image viewing */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxSrc}
            alt="Screenshot full size"
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function CommentCard({
  comment,
  isDone,
  onToggle,
  onDelete,
  onImageClick,
}: {
  comment: Comment;
  isDone?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onImageClick: (src: string) => void;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${isDone ? "border-dashed bg-muted/40 opacity-70" : "bg-white"}`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${isDone ? "text-muted-foreground" : "text-foreground"}`}
          >
            {comment.author}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onToggle}
            className={`rounded p-1 transition-colors ${isDone ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            title={isDone ? "Reopen" : "Mark as done"}
          >
            {isDone ? (
              <Check className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Comment text */}
      {comment.content && comment.content !== "(screenshot)" && (
        <p
          className={`text-sm leading-relaxed ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}
        >
          {comment.content}
        </p>
      )}

      {/* Screenshot thumbnail */}
      {comment.image && (
        <button
          type="button"
          onClick={() => onImageClick(comment.image!)}
          className="mt-2 block overflow-hidden rounded border transition-opacity hover:opacity-80"
          title="Click to enlarge"
        >
          <img
            src={comment.image}
            alt="Screenshot"
            className="max-h-40 max-w-full object-contain"
          />
        </button>
      )}
    </div>
  );
}
