"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  landProtectionContentApi,
  LandProtectionVideo,
} from "@/lib/api";

const EMPTY_FORM = { title: "", displayOrder: 0 };
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60; // ~2 minutes

export default function LandProtectionVideosPage() {
  const [videos, setVideos] = useState<LandProtectionVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await landProtectionContentApi.getVideos(1, 50);
      setVideos(response.data);
    } catch (err) {
      console.error("Failed to fetch land protection videos:", err);
      setError("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const sortedVideos = videos.slice().sort((a, b) => a.displayOrder - b.displayOrder);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (video: LandProtectionVideo) => {
    setEditingId(video.id);
    setForm({ title: video.title, displayOrder: video.displayOrder });
    setSelectedFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const pollUploadTask = async (taskId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const task = await landProtectionContentApi.getUploadTask(taskId);
      if (task.status === "COMPLETED") return;
      if (task.status === "FAILED") {
        throw new Error(task.errorMessage || "Video upload failed");
      }
      setUploadStatus(
        task.status === "UPLOADING" ? "Uploading video…" : "Queued…",
      );
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error(
      "Video processing is taking longer than expected. It may still complete in the background — refresh shortly.",
    );
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!editingId && !selectedFile) {
      setError("Select a video file");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await landProtectionContentApi.updateVideo(
          editingId,
          { title: form.title, displayOrder: form.displayOrder },
          selectedFile || undefined,
        );
      } else {
        setUploadStatus("Uploading video…");
        const task = await landProtectionContentApi.addVideo(
          form.title,
          selectedFile as File,
          form.displayOrder,
        );
        await pollUploadTask(task.id);
      }
      setIsModalOpen(false);
      await fetchVideos();
    } catch (err) {
      console.error("Failed to save land protection video:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save video",
      );
    } finally {
      setIsSaving(false);
      setUploadStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await landProtectionContentApi.deleteVideo(id);
      await fetchVideos();
    } catch (err) {
      console.error("Failed to delete land protection video:", err);
      setError("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (video: LandProtectionVideo, direction: "up" | "down") => {
    const idx = sortedVideos.findIndex((v) => v.id === video.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedVideos.length) return;
    const other = sortedVideos[swapIdx];

    setReorderingId(video.id);
    setError("");
    try {
      await Promise.all([
        landProtectionContentApi.updateVideo(video.id, {
          displayOrder: other.displayOrder,
        }),
        landProtectionContentApi.updateVideo(other.id, {
          displayOrder: video.displayOrder,
        }),
      ]);
      await fetchVideos();
    } catch (err) {
      console.error("Failed to reorder land protection videos:", err);
      setError("Failed to reorder videos");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/dashboard/explore-categories/land-protection"
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-2xl font-medium text-gray-900">
          Land Protection Videos
        </h1>
      </div>
      <p className="text-gray-500 italic ml-8 mb-2">
        Manage the explainer videos shown on the Land Protection screen (max
        3-4 videos).
      </p>

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : sortedVideos.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No videos yet. Add one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedVideos.map((video, index) => (
              <div
                key={video.id}
                className="border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col"
              >
                <video
                  src={video.videoUrl}
                  controls
                  className="w-full h-48 bg-black object-contain"
                />
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {video.title}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 shrink-0">
                      #{video.displayOrder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(video, "up")}
                        disabled={index === 0 || reorderingId !== null}
                        className="p-1.5 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(video, "down")}
                        disabled={
                          index === sortedVideos.length - 1 ||
                          reorderingId !== null
                        }
                        className="p-1.5 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {reorderingId === video.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingId === video.id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Video" : "Add Video"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. How Land Protection Works"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Display Order (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      displayOrder: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Video File {editingId ? "(optional — leave empty to keep current)" : ""}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">Max 100MB.</p>
              </div>
              {uploadStatus && (
                <div className="flex items-center gap-2 text-sm text-[#1e2667]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
