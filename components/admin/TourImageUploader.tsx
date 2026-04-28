"use client"

import { useRef, useState, useTransition } from "react"
import { ImagePlus, Loader2, Trash2, X } from "lucide-react"
import { uploadTourImage, deleteTourImage } from "@/app/admin/tours/image-actions"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface TourImage {
  id: string
  image_url: string
}

// ─── Queued file (not yet uploaded, used in Create mode) ────────────────────

interface QueuedFile {
  key: string          // local temp key
  file: File
  previewUrl: string  // object URL for preview
}

// ─── Existing image (already in DB) ─────────────────────────────────────────

interface ExistingImageProps {
  mode: "existing"
  tourId: string
  images: TourImage[]
  onChange: (images: TourImage[]) => void
  loading?: boolean
}

interface QueuedImageProps {
  mode: "queued"
  files: QueuedFile[]
  onChange: (files: QueuedFile[]) => void
}

type TourImageUploaderProps = ExistingImageProps | QueuedImageProps

// ─── Drop zone (shared) ──────────────────────────────────────────────────────

function DropZone({ onFiles, uploading }: { onFiles: (f: FileList) => void; uploading: boolean }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {uploading
        ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
      <div>
        <p className="text-sm font-medium">{uploading ? "Đang tải lên..." : "Kéo ảnh vào đây hoặc nhấn để chọn"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP · Tối đa 5 MB / ảnh</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files) }} />
    </div>
  )
}

// ─── Existing-images uploader (Edit mode) ────────────────────────────────────

function ExistingUploader({ tourId, images, onChange, loading }: ExistingImageProps) {
  const [uploading, startUpload] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(files: FileList) {
    setError(null)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { setError("Chỉ chấp nhận file ảnh"); continue }
      if (file.size > 5 * 1024 * 1024) { setError("Mỗi ảnh tối đa 5 MB"); continue }
      const fd = new FormData()
      fd.append("tourId", tourId)
      fd.append("file", file)
      startUpload(async () => {
        try {
          const result = await uploadTourImage(fd)
          onChange([...images, { id: result.id, image_url: result.url }])
        } catch (e) { setError(e instanceof Error ? e.message : "Upload thất bại") }
      })
    }
  }

  async function handleDelete(img: TourImage) {
    setDeleting(img.id)
    try {
      await deleteTourImage(img.id, img.image_url)
      onChange(images.filter((i) => i.id !== img.id))
    } catch (e) { setError(e instanceof Error ? e.message : "Xoá thất bại") }
    finally { setDeleting(null) }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-4">Đang tải ảnh...</p>

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
              <Image src={img.image_url} alt="Tour" fill className="object-cover" sizes="150px" />
              <button type="button" onClick={() => handleDelete(img)} disabled={deleting === img.id}
                className="absolute top-1 right-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow">
                {deleting === img.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      )}
      <DropZone onFiles={handleFiles} uploading={uploading} />
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  )
}

// ─── Queued-files uploader (Create mode — no tourId yet) ─────────────────────

function QueuedUploader({ files, onChange }: QueuedImageProps) {
  const [error, setError] = useState<string | null>(null)

  function handleFiles(fileList: FileList) {
    setError(null)
    const newFiles: QueuedFile[] = []
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) { setError("Chỉ chấp nhận file ảnh"); continue }
      if (file.size > 5 * 1024 * 1024) { setError("Mỗi ảnh tối đa 5 MB"); continue }
      newFiles.push({ key: `${Date.now()}-${file.name}`, file, previewUrl: URL.createObjectURL(file) })
    }
    onChange([...files, ...newFiles])
  }

  function removeFile(key: string) {
    const removed = files.find((f) => f.key === key)
    if (removed) URL.revokeObjectURL(removed.previewUrl)
    onChange(files.filter((f) => f.key !== key))
  }

  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((qf) => (
            <div key={qf.key} className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qf.previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeFile(qf.key)}
                className="absolute top-1 right-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <DropZone onFiles={handleFiles} uploading={false} />
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.length} ảnh sẽ được tải lên sau khi lưu tour.
        </p>
      )}
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function TourImageUploader(props: TourImageUploaderProps) {
  if (props.mode === "existing") {
    return <ExistingUploader {...props} />
  }
  return <QueuedUploader {...props} />
}

// Helper to bulk-upload queued files after a tour is created
export async function uploadQueuedFiles(tourId: string, files: QueuedFile[]) {
  for (const qf of files) {
    const fd = new FormData()
    fd.append("tourId", tourId)
    fd.append("file", qf.file)
    await uploadTourImage(fd)
  }
}
