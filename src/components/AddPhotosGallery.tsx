"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type AddPhotosGalleryProps = {
  initialImages: string[];
};

type GalleryImage = {
  id: string;
  url: string;
  objectPath?: string;
  isRecent?: boolean;
};

type UploadTask = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

type StorageListObject = {
  name: string;
  created_at?: string;
  updated_at?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ENV_STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

function buildPublicUrl(bucket: string, objectPath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
}

function parsePublicUrl(url: string): { bucket: string; objectPath: string } | null {
  if (!SUPABASE_URL) return null;
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;
  const remainder = url.slice(prefix.length);
  const slashIndex = remainder.indexOf("/");
  if (slashIndex === -1) return null;
  const bucket = remainder.slice(0, slashIndex);
  const objectPath = remainder.slice(slashIndex + 1);
  if (!bucket || !objectPath) return null;
  return { bucket, objectPath };
}

function uploadFileWithProgress(
  file: File,
  bucket: string,
  objectPath: string,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(xhr.responseText || xhr.statusText || `HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading file."));
    xhr.send(file);
  });
}

export function AddPhotosGallery({ initialImages }: AddPhotosGalleryProps) {
  const NOTES_STORAGE_KEY = "mot-mot-photo-notes";
  const [activeBucket, setActiveBucket] = useState<string | null>(ENV_STORAGE_BUCKET ?? null);
  const [images, setImages] = useState<GalleryImage[]>(
    initialImages.map((url, index) => ({
      id: `initial-${index}`,
      url,
      objectPath: parsePublicUrl(url)?.objectPath,
      isRecent: false,
    })),
  );
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [imageToConfirmDelete, setImageToConfirmDelete] = useState<GalleryImage | null>(null);
  const [flippedImageId, setFlippedImageId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [notesByUrl, setNotesByUrl] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canUpload = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

  const visibleImages = useMemo(() => images, [images]);
  const sizeVariants = [
    "photo-size-micro",
    "photo-size-standard",
    "photo-size-portrait",
    "photo-size-tall",
    "photo-size-poster",
    "photo-size-wide",
    "photo-size-cinematic",
    "photo-size-giant",
  ];
  const frameVariants = ["frame-polaroid", "frame-film", "frame-scrapbook"];

  const getHash = (image: GalleryImage, index: number) => {
    const source = `${image.url}-${index}`;
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash * 31 + source.charCodeAt(i)) % 2147483647;
    }
    return Math.abs(hash);
  };

  const getSizeVariant = (image: GalleryImage, index: number) => {
    const hash = getHash(image, index);
    return sizeVariants[hash % sizeVariants.length];
  };

  const getFrameVariant = (image: GalleryImage, index: number) => {
    const hash = getHash(image, index);
    return frameVariants[hash % frameVariants.length];
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      setNotesByUrl(parsed);
    } catch {
      // Ignore invalid local cache.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesByUrl));
  }, [notesByUrl]);

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const ensureBucket = async () => {
    if (!canUpload) return null;
    if (activeBucket) return activeBucket;

    try {
      const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        headers: {
          apikey: SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) return null;
      const buckets = (await response.json()) as Array<{ id: string }>;
      const firstBucket = buckets[0]?.id ?? null;
      if (firstBucket) {
        setActiveBucket(firstBucket);
      }
      return firstBucket;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!canUpload) return;
    let isMounted = true;

    const loadStoredUploads = async () => {
      const bucket = await ensureBucket();
      if (!bucket || !isMounted) return;

      try {
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prefix: "uploads",
            limit: 200,
            offset: 0,
            sortBy: { column: "created_at", order: "desc" },
          }),
        });

        if (!response.ok || !isMounted) return;

        const objects = (await response.json()) as StorageListObject[];
        const uploadedImages: GalleryImage[] = objects
          .filter((item) => item.name)
          .map((item) => {
            const objectPath = `uploads/${item.name}`;
            return {
              id: `stored-${objectPath}`,
              url: buildPublicUrl(bucket, objectPath),
              objectPath,
              isRecent: false,
            };
          });

        setImages((prev) => {
          const seen = new Set<string>();
          const merged = [...uploadedImages, ...prev].filter((image) => {
            if (seen.has(image.url)) return false;
            seen.add(image.url);
            return true;
          });
          return merged;
        });
      } catch {
        // Keep existing initial images when listing uploads fails.
      }
    };

    void loadStoredUploads();

    return () => {
      isMounted = false;
    };
  }, [canUpload]);

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (!canUpload) {
      setError("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const bucket = await ensureBucket();
      if (!bucket) {
        throw new Error(
          "No storage bucket found. Create a Supabase Storage bucket or set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET in .env.local.",
        );
      }

      for (const file of files) {
        const taskId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploads((prev) => [...prev, { id: taskId, name: file.name, progress: 0, status: "uploading" }]);

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const objectPath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
        await uploadFileWithProgress(file, bucket, objectPath, (progress) => {
          setUploads((prev) => prev.map((task) => (task.id === taskId ? { ...task, progress } : task)));
        });

        const publicUrl = buildPublicUrl(bucket, objectPath);
        const newImageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newImage: GalleryImage = {
          id: newImageId,
          url: publicUrl,
          objectPath,
          isRecent: true,
        };

        // Best effort insert so new photos also appear in server-fetched memories.
        await fetch(`${SUPABASE_URL}/rest/v1/memories`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            title: "New Memory",
            description: "Uploaded from Add Photos",
            memory_date: new Date().toISOString().slice(0, 10),
            image_url: publicUrl,
          }),
        }).catch(() => {
          // If table policy blocks insert, uploaded image still appears instantly in UI.
        });

        setImages((prev) => [newImage, ...prev]);
        setUploads((prev) => prev.map((task) => (task.id === taskId ? { ...task, progress: 100, status: "done" } : task)));
        window.setTimeout(() => {
          setUploads((prev) => prev.filter((task) => task.id !== taskId || task.status !== "done"));
        }, 1800);

        // Remove "recently added" badge after a short highlight period.
        window.setTimeout(() => {
          setImages((prev) => prev.map((image) => (image.id === newImageId ? { ...image, isRecent: false } : image)));
        }, 12000);
      }
      event.target.value = "";
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload photos.";
      if (message.includes("Bucket not found")) {
        setError(
          "Storage bucket not found. Create one in Supabase Storage, then set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET in .env.local.",
        );
      } else {
        setError(message);
      }
      setUploads((prev) =>
        prev.map((task) => (task.status === "uploading" ? { ...task, status: "error", error: "Upload failed" } : task)),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (image: GalleryImage) => {
    setError(null);
    setDeletingImageId(image.id);
    const previousImages = images;

    setImages((prev) => prev.filter((item) => item.id !== image.id));
    setNotesByUrl((prev) => {
      const next = { ...prev };
      delete next[image.url];
      return next;
    });

    try {
      if (!canUpload) return;

      const parsed = parsePublicUrl(image.url);
      if (image.objectPath && parsed?.bucket) {
        await fetch(`${SUPABASE_URL}/storage/v1/object/${parsed.bucket}/${image.objectPath}`, {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }).catch(() => {
          // Keep UI responsive even if storage policy blocks delete.
        });
      }

      await fetch(
        `${SUPABASE_URL}/rest/v1/memories?image_url=eq.${encodeURIComponent(image.url)}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=minimal",
          },
        },
      ).catch(() => {
        // Deleting row is optional; keep removed from current UI regardless.
      });
    } catch {
      setImages(previousImages);
      setError("Failed to delete photo. Please try again.");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!imageToConfirmDelete) return;
    await handleDeletePhoto(imageToConfirmDelete);
    setImageToConfirmDelete(null);
  };

  const toggleFlip = (imageId: string) => {
    setFlippedImageId((prev) => (prev === imageId ? null : imageId));
    setEditingImageId(null);
  };

  const startEditingMessage = (image: GalleryImage) => {
    setEditingImageId(image.id);
    setDraftMessage(notesByUrl[image.url] ?? "");
  };

  const saveMessage = async (image: GalleryImage) => {
    const message = draftMessage.trim();
    setSavingMessageId(image.id);
    setNotesByUrl((prev) => ({ ...prev, [image.url]: message }));
    setEditingImageId(null);

    if (canUpload) {
      try {
        const patchResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/memories?image_url=eq.${encodeURIComponent(image.url)}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({ description: message }),
          },
        );

        // If no existing memory row was updated, attempt a best-effort insert.
        if (!patchResponse.ok) {
          await fetch(`${SUPABASE_URL}/rest/v1/memories`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              title: "Photo Note",
              description: message,
              memory_date: new Date().toISOString().slice(0, 10),
              image_url: image.url,
            }),
          }).catch(() => {
            // Local note is already stored.
          });
        }
      } catch {
        // Local note remains saved even if remote update fails.
      }
    }

    setSavingMessageId(null);
  };

  return (
    <div className="romantic-panel stitched highlight-gallery-panel relative mx-auto rounded-[2.1rem] p-6 sm:p-10">
      <span className="floating-note left-6 top-4 rotate-[-9deg]">favorite shots</span>
      <span className="floating-note right-28 top-4 rotate-[8deg]">keep adding</span>
      <div className="gallery-highlight-glow" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-rose-600">Highlight Section</p>
          <p className="mt-1 text-sm font-medium text-rose-700">Add your memories anytime</p>
        </div>
        <button
          type="button"
          onClick={handlePickFiles}
          disabled={isUploading || !canUpload}
          className="btn-secondary luxury-card px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Add Photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}
      {uploads.length > 0 ? (
        <div className="mb-5 space-y-2">
          {uploads.map((task) => (
            <div key={task.id} className="upload-task-row">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-medium text-rose-700">{task.name}</p>
                <p className="text-[11px] text-rose-500">
                  {task.status === "error" ? "Failed" : `${task.progress}%`}
                </p>
              </div>
              <div className="upload-task-track">
                <span className="upload-task-bar" style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mx-auto columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
        {visibleImages.map((image, index) => (
          <figure
            key={image.id}
            className={`polaroid luxury-card group relative break-inside-avoid overflow-hidden rounded-2xl ${getSizeVariant(image, index)} ${getFrameVariant(image, index)}`}
          >
            {image.isRecent ? <span className="recently-added-badge">Recently added</span> : null}
            <button
              type="button"
              aria-label="Delete photo"
              onClick={() => setImageToConfirmDelete(image)}
              disabled={deletingImageId === image.id}
              className="delete-photo-btn"
            >
              {deletingImageId === image.id ? "..." : "Delete"}
            </button>
            <div
              className="photo-flip-shell"
              role="button"
              tabIndex={0}
              onClick={() => toggleFlip(image.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleFlip(image.id);
                }
              }}
            >
              <div className={`photo-flip-inner ${flippedImageId === image.id ? "is-flipped" : ""}`}>
                <div className="photo-flip-face photo-flip-front">
                  <img
                    src={image.url}
                    alt={`Collage photo ${index + 1}`}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <span className="photo-flip-hint">Tap to flip</span>
                </div>
                <div className="photo-flip-face photo-flip-back">
                  {editingImageId === image.id ? (
                    <>
                      <textarea
                        value={draftMessage}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        rows={4}
                        maxLength={220}
                        placeholder="Write a short message for this photo..."
                        className="w-full rounded-xl border border-rose-200 bg-white/92 px-3 py-2 text-sm text-rose-800 outline-none focus:border-rose-400"
                      />
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingImageId(null);
                          }}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void saveMessage(image);
                          }}
                          disabled={savingMessageId === image.id}
                          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-70"
                        >
                          {savingMessageId === image.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-center text-xs font-semibold tracking-[0.16em] uppercase text-rose-500">
                        Photo message
                      </p>
                      <p className="mt-2 line-clamp-6 text-center text-sm leading-6 text-rose-700">
                        {notesByUrl[image.url]?.trim() || "No message yet. Add one for this memory."}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditingMessage(image);
                          }}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </figure>
        ))}
      </div>

      {imageToConfirmDelete ? (
        <div className="delete-modal-backdrop">
          <div className="delete-modal-card luxury-card">
            <p className="text-base font-semibold text-rose-900">Are you sure?</p>
            <p className="mt-1 text-sm text-rose-700">This photo will be removed from the gallery.</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImageToConfirmDelete(null)}
                className="btn-secondary px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingImageId === imageToConfirmDelete.id}
                className="btn-danger px-3 py-1.5 text-sm disabled:opacity-70"
              >
                {deletingImageId === imageToConfirmDelete.id ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
