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
}

interface VideoUploadCardProps {
  pathway: string;
  description: string;
  initialVideo?: VideoFile;
}

export function VideoUploadCard({
  pathway,
  description,
  initialVideo,
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Card header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Play className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{pathway}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <Badge variant={hasVideo ? "uploaded" : "no-video"}>
            {hasVideo ? "Uploaded" : "No Video"}
          </Badge>
        </div>

        {/* Content area */}
        {hasVideo ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            {/* Video thumbnail placeholder */}
            <div className="relative h-32 w-48 shrink-0 rounded-lg bg-gray-900 overflow-hidden flex items-center justify-center">
              <div className="text-white text-xs text-center p-2 opacity-70">
                <Play className="h-8 w-8 mx-auto mb-1" />
                Video Preview
              </div>
            </div>

            {/* File info */}
            <div className="flex-1 space-y-1.5">
              <p className="text-xs text-gray-500">File Name</p>
              <p className="text-sm font-medium text-gray-900">{video.name}</p>

              <div className="flex gap-6 text-xs text-gray-500 mt-2">
                <span>Size <span className="font-medium text-gray-700">{video.size}</span></span>
                <span>Duration <span className="font-medium text-gray-700">{video.duration}</span></span>
                <span>Uploaded <span className="font-medium text-gray-700">{video.uploaded}</span></span>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={handleReplace}
                  className="text-gray-600"
                >
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setShowConfirm(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
              <p className="text-sm font-medium text-gray-700">Click to upload welcome video</p>
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
