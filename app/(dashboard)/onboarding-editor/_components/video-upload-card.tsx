"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, RefreshCw, Trash2, Play } from "lucide-react";
import { Badge, Button, ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui";
import { pathwaysService } from "@/lib/services/pathways";
import { cn } from "@/lib/utils";

interface VideoFile {
  name?: string;
  size?: string;
  duration?: string;
  uploaded?: string;
  url?: string; // External link from backend (video_link field)
  previewUrl?: string;
}

interface VideoUploadCardProps {
  pathway: string;
  description: string;
  initialVideo?: VideoFile;
  slug?: string; // Pathway slug for update calls
  onUploaded?: () => void;
}

import { useUploads } from "@/lib/contexts/upload-context";

export function VideoUploadCard({
  pathway,
  description,
  initialVideo,
  slug,
  onUploaded,
}: VideoUploadCardProps) {
  const { uploads, startUpload, clearUpload } = useUploads();
  const activeUpload = slug ? uploads[slug] : undefined;
  
  const [video, setVideo] = useState<VideoFile | undefined>(initialVideo);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const hasVideo = !!video;
  const videoSrc = video?.previewUrl || video?.url;

  useEffect(() => {
    // If not currently uploading locally, but there's a global upload
    if (activeUpload) {
      if (activeUpload.status === "uploading") {
        setIsUploading(true);
        if (!video || video.uploaded !== "Uploading") {
          setVideo({
            name: activeUpload.fileName,
            size: activeUpload.fileSize,
            duration: "—",
            uploaded: "Uploading",
          });
        }
      } else if (activeUpload.status === "completed") {
        setIsUploading(false);
        setVideo({
          name: activeUpload.fileName,
          size: activeUpload.fileSize,
          duration: "—",
          uploaded: new Date().toISOString().split("T")[0],
          url: activeUpload.resultUrl,
        });
        clearUpload(slug!);
        onUploaded?.();
      } else if (activeUpload.status === "error") {
        setIsUploading(false);
        toast(activeUpload.error || "Upload failed", "error");
        clearUpload(slug!);
        setVideo(initialVideo); // Reset to initial state
      }
    } else {
      setVideo(initialVideo);
    }
  }, [activeUpload, initialVideo, slug]);

  useEffect(() => {
    return () => {
      if (video?.previewUrl) URL.revokeObjectURL(video.previewUrl);
    };
  }, [video?.previewUrl]);

  const getRecord = (value: unknown) =>
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : undefined;

  const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
  };

  const getUploadedVideoUrl = (result: unknown): string | undefined => {
    const root = getRecord(result);
    const data = getRecord(root?.data);
    const pathway = getRecord(data?.pathway);
    
    const url =
      pathway?.video_link ||
      data?.video_link ||
      data?.video_url ||
      data?.url ||
      root?.video_link ||
      root?.video_url ||
      root?.url;

    return typeof url === "string" ? url : undefined;
  };

  // Helper to parse filename and date from URL
  const inferMetadataFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      const lastPart = parts[parts.length - 1].split("?")[0];
      
      // Check if it matches our R2 pattern: timestamp-filename.ext
      const match = lastPart.match(/^(\d+)-(.*)$/);
      if (match) {
        const timestamp = parseInt(match[1]);
        const filename = match[2];
        return {
          name: filename,
          uploaded: new Date(timestamp).toLocaleDateString(),
        };
      }
      
      return {
        name: lastPart || "Welcome Video",
        uploaded: "Uploaded",
      };
    } catch (e) {
      return { name: "Welcome Video", uploaded: "Uploaded" };
    }
  };

  // Effect to infer metadata if initialVideo only has a URL
  useEffect(() => {
    if (initialVideo?.url && (initialVideo.name === "Welcome Video" || initialVideo.size === "External Link")) {
      const inferred = inferMetadataFromUrl(initialVideo.url);
      setVideo(prev => prev ? {
        ...prev,
        name: prev.name === "Welcome Video" || !prev.name ? inferred.name : prev.name,
        uploaded: prev.uploaded === "Uploaded" || !prev.uploaded ? inferred.uploaded : prev.uploaded,
      } : prev);
    }
  }, [initialVideo?.url]);

  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const durationInSeconds = videoElement.duration;
    
    if (!isNaN(durationInSeconds)) {
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      
      setVideo(prev => prev ? {
        ...prev,
        duration: durationStr,
      } : prev);
    }
  };

  const handleRemove = async () => {
    if (!slug) {
      setVideo(undefined);
      setShowConfirm(false);
      toast("Welcome video removed successfully.");
      return;
    }

    try {
      const result = await pathwaysService.update(slug, { video_link: null });
      if (result.success === false) {
        toast(result.error || "Failed to remove welcome video.", "error");
        return;
      }

      setVideo(undefined);
      setShowConfirm(false);
      onUploaded?.();
      toast("Welcome video removed successfully.");
    } catch (error: unknown) {
      toast(getErrorMessage(error, "Failed to remove welcome video."), "error");
    }
  };

  const handleReplace = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (file: File) => {
    if (!slug) {
      toast("Cannot upload this video because the pathway slug is missing.", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    
    setVideo({
      name: file.name,
      size: fileSize,
      duration: "—",
      uploaded: "Uploading",
      previewUrl,
    });
    setIsUploading(true);

    // Start background upload
    startUpload(slug, file);
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
            {isUploading ? "Uploading" : hasVideo ? "Uploaded" : "No Video"}
          </Badge>
        </div>

        {/* Content area */}
        {hasVideo ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            {/* Video thumbnail / link */}
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                preload="metadata"
                onLoadedMetadata={handleMetadataLoaded}
                className="h-32 w-48 shrink-0 rounded-lg bg-gray-900 object-cover"
              />
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
                <p className="text-sm font-semibold text-primary truncate">{video.name || "Loading..."}</p>
              </div>
 
              <div className="flex gap-8 border-y border-border py-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Size</p>
                  <p className="text-xs font-semibold text-primary">{video.size || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Duration</p>
                  <p className="text-xs font-semibold text-primary">{video.duration || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">Uploaded</p>
                  <p className="text-xs font-semibold text-primary">{video.uploaded || "—"}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={handleReplace}
                  isLoading={isUploading}
                  className="bg-background border-border text-primary hover:bg-background/80"
                >
                  Replace Video
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setShowConfirm(true)}
                  disabled={isUploading}
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
            disabled={isUploading}
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
              <p className="text-sm font-normal text-gray-700">
                {isUploading ? "Uploading welcome video..." : "Click to upload welcome video"}
              </p>
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
              handleFileChange(file);
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
