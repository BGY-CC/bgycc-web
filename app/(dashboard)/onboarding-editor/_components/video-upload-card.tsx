"use client";

import { useState, useRef } from "react";
import { Upload, RefreshCw, Trash2, Play } from "lucide-react";
import { Badge, Button, ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

interface VideoFile {
  name: string;
  size: string;
  duration: string;
  uploaded: string;
  url?: string; // External link from backend (video_link field)
}

interface VideoUploadCardProps {
  pathway: string;
  description: string;
  initialVideo?: VideoFile;
  slug?: string; // Pathway slug for update calls
}

export function VideoUploadCard({
  pathway,
  description,
  initialVideo,
  slug,
}: VideoUploadCardProps) {
  const [video, setVideo] = useState<VideoFile | undefined>(initialVideo);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const hasVideo = !!video;

  const handleRemove = () => {
    setVideo(undefined);
    setShowConfirm(false);
    toast("Welcome video removed successfully.");
  };

  const handleReplace = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:border-primary/20 transition-all group">
        {/* Card header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-primary shadow-sm group-hover:scale-105 transition-transform">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-primary tracking-tight">{pathway}</p>
              <p className="text-[13px] font-normal text-muted mt-1">{description}</p>
            </div>
          </div>
          <Badge variant={hasVideo ? "uploaded" : "no-video"} className="font-semibold px-3 py-1">
            {hasVideo ? "Uploaded" : "No Video"}
          </Badge>
        </div>

        {/* Content area */}
        {hasVideo ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            {/* Video thumbnail / link */}
            {video.url ? (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative h-32 w-48 shrink-0 rounded-lg bg-gray-900 overflow-hidden flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity"
              >
                <Play className="h-8 w-8 text-white" />
                <span className="text-white text-[10px] font-semibold uppercase tracking-wider">Watch Video</span>
              </a>
            ) : (
              <div className="relative h-32 w-48 shrink-0 rounded-lg bg-gray-900 overflow-hidden flex items-center justify-center">
                <div className="text-white text-xs text-center p-2 opacity-70">
                  <Play className="h-8 w-8 mx-auto mb-1" />
                  Video Preview
                </div>
              </div>
            )}

            {/* File info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-[0.1em]">File Name</p>
                <p className="text-sm font-semibold text-primary">{video.name}</p>
              </div>

              <div className="flex gap-8 border-y border-border py-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Size</p>
                  <p className="text-xs font-semibold text-primary">{video.size}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Duration</p>
                  <p className="text-xs font-semibold text-primary">{video.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Uploaded</p>
                  <p className="text-xs font-semibold text-primary">{video.uploaded}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={handleReplace}
                  className="bg-background border-border text-primary hover:bg-background/80"
                >
                  Replace Video
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setShowConfirm(true)}
                  className="text-error hover:text-error hover:bg-error-bg font-semibold"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload dropzone */
          <button
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200",
              "py-10 text-center transition-colors",
              "hover:border-primary hover:bg-primary/5",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
              <Upload className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-normal text-gray-700">Click to upload welcome video</p>
              <p className="text-xs text-gray-400 mt-0.5">MP4, MOV, or WebM • Max 500MB</p>
            </div>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="sr-only"
          aria-label={`Upload video for ${pathway}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Simulate upload — real upload handled in Phase 2
              setVideo({
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                duration: "—",
                uploaded: new Date().toISOString().split("T")[0],
              });
            }
          }}
        />
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Welcome Video"
        description={`Are you sure you want to remove the welcome video for ${pathway}? New members on this pathway won't see a welcome video until you upload a new one.`}
        confirmLabel="Delete"
      />
    </>
  );
}
