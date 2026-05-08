import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { UploadProvider, useUploads } from "@/lib/contexts/upload-context";
import * as pathwaysService from "@/lib/services/pathways";

describe("UploadProvider / useUploads", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when useUploads is called outside of UploadProvider", () => {
    // Suppress expected error output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useUploads());
    }).toThrow("useUploads must be used within an UploadProvider");

    consoleSpy.mockRestore();
  });

  it("provides empty uploads state initially", () => {
    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    expect(result.current.uploads).toEqual({});
  });

  it("startUpload sets uploading state and completes on success", async () => {
    const uploadVideoMock = vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: true,
      data: { pathway: { video_link: "https://cdn.example.com/video.mp4" } },
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const file = new File(["video"], "test.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file);
    });

    expect(uploadVideoMock).toHaveBeenCalledWith("leadership", file);
    expect(result.current.uploads["leadership"].status).toBe("completed");
    expect(result.current.uploads["leadership"].progress).toBe(100);
    expect(result.current.uploads["leadership"].resultUrl).toBe("https://cdn.example.com/video.mp4");
  });

  it("calls onComplete callback with video URL when upload succeeds", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: true,
      data: { video_link: "https://cdn.example.com/v2.mp4" },
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const onComplete = vi.fn();
    const file = new File(["video"], "v2.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("public_speaking", file, onComplete);
    });

    expect(onComplete).toHaveBeenCalledWith("https://cdn.example.com/v2.mp4");
  });

  it("does NOT call onComplete when upload succeeds but video_link is absent", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: true,
      data: {},
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const onComplete = vi.fn();
    const file = new File(["video"], "no-link.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file, onComplete);
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.uploads["leadership"].status).toBe("completed");
  });

  it("sets error status when upload fails (success: false)", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: false,
      error: "Upload failed on server",
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const file = new File(["video"], "fail.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file);
    });

    expect(result.current.uploads["leadership"].status).toBe("error");
    expect(result.current.uploads["leadership"].error).toBe("Upload failed on server");
  });

  it("sets error status when uploadVideo throws", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockRejectedValue(
      new Error("Network failure")
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const file = new File(["video"], "throw.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file);
    });

    expect(result.current.uploads["leadership"].status).toBe("error");
    expect(result.current.uploads["leadership"].error).toBe("Network failure");
    consoleSpy.mockRestore();
  });

  it("clearUpload removes the upload entry", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: true,
      data: { video_link: "https://cdn.example.com/done.mp4" },
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    const file = new File(["video"], "done.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file);
    });

    expect(result.current.uploads["leadership"]).toBeDefined();

    act(() => {
      result.current.clearUpload("leadership");
    });

    expect(result.current.uploads["leadership"]).toBeUndefined();
  });

  it("tracks file size on the upload state", async () => {
    vi.spyOn(pathwaysService.pathwaysService, "uploadVideo").mockResolvedValue({
      success: true,
      data: { video_link: "https://cdn.example.com/sized.mp4" },
    } as any);

    const { result } = renderHook(() => useUploads(), {
      wrapper: UploadProvider,
    });

    // 1 MB = 1048576 bytes
    const content = new Uint8Array(1048576);
    const file = new File([content], "sized.mp4", { type: "video/mp4" });

    await act(async () => {
      await result.current.startUpload("leadership", file);
    });

    expect(result.current.uploads["leadership"].fileSize).toBe("1.0 MB");
  });
});
