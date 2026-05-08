"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { pathwaysService } from "@/lib/services/pathways";

export interface UploadState {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  resultUrl?: string;
  fileSize?: string;
}

interface UploadContextType {
  uploads: Record<string, UploadState>;
  startUpload: (slug: string, file: File, onComplete?: (url: string) => void) => Promise<void>;
  clearUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

import { Play, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ... (rest of the interface definitions)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});

  const startUpload = useCallback(async (slug: string, file: File, onComplete?: (url: string) => void) => {
    const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    
    setUploads((prev) => ({
      ...prev,
      [slug]: {
        id: slug,
        fileName: file.name,
        progress: 10,
        status: "uploading",
        fileSize,
      },
    }));

    try {
      const result = await pathwaysService.uploadVideo(slug, file);
      
      if (result.success) {
        const videoLink = result.data?.pathway?.video_link || 
                         result.data?.video_link || 
                         result.video_link;

        setUploads((prev) => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            status: "completed",
            progress: 100,
            resultUrl: videoLink,
          },
        }));
        
        if (onComplete && videoLink) {
          onComplete(videoLink);
        }
      } else {
        throw new Error(result.error || result.message || "Upload failed");
      }
    } catch (error: unknown) {
      console.error("Background upload error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setUploads((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug],
          status: "error",
          error: message,
        },
      }));
    }
  }, []);

  const clearUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const activeUploads = Object.values(uploads);

  return (
    <UploadContext.Provider value={{ uploads, startUpload, clearUpload }}>
      {children}
      
      {/* Global Upload Status Overlay */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeUploads.map((upload) => (
          <div 
            key={upload.id}
            className={cn(
              "pointer-events-auto bg-white border rounded-2xl p-4 shadow-2xl transition-all duration-500 transform translate-y-0",
              "flex flex-col gap-3 overflow-hidden",
              upload.status === "completed" ? "border-green-100 ring-1 ring-green-50" : 
              upload.status === "error" ? "border-red-100 ring-1 ring-red-50" : 
              "border-slate-100"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  upload.status === "completed" ? "bg-green-50 text-green-600" :
                  upload.status === "error" ? "bg-red-50 text-red-600" :
                  "bg-indigo-50 text-indigo-600"
                )}>
                  {upload.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> :
                   upload.status === "error" ? <AlertCircle className="h-4 w-4" /> :
                   <Play className="h-4 w-4 animate-pulse" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {upload.status === "completed" ? "Upload Complete" :
                     upload.status === "error" ? "Upload Failed" :
                     "Uploading Video..."}
                  </p>
                  <p className="text-[12px] text-slate-500 truncate">{upload.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => clearUpload(upload.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {upload.status === "uploading" && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}
            
            {upload.status === "error" && (
              <p className="text-[11px] text-red-500 font-medium">{upload.error}</p>
            )}
          </div>
        ))}
      </div>
    </UploadContext.Provider>
  );
}

export function useUploads() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUploads must be used within an UploadProvider");
  }
  return context;
}
