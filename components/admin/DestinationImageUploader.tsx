"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { ImagePlus, Loader2, Trash2, X } from "lucide-react"
import {
  deleteDestinationImage,
  uploadDestinationImage,
} from "@/app/admin/destinations/image-actions"
import { cn } from "@/lib/utils"

export interface QueuedDestinationImage {
  key: string
  file: File
  previewUrl: string
}

interface QueuedProps {
  mode: "queued"
  file: QueuedDestinationImage | null
  onChange: (file: QueuedDestinationImage | null) => void
}

interface ExistingProps {
  mode: "existing"
  destinationId: string
  imageUrl: string | null
  onChange: (imageUrl: string | null) => void
}

type DestinationImageUploaderProps = QueuedProps | ExistingProps

function DropZone({ onFile, uploading }: { onFile: (file: File) => void; uploading: boolean }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragOver(false)
        handleFiles(event.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {uploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <ImagePlus className="h-5 w-5 text-muted-foreground" />
      )}
      <div>
        <p className="text-sm font-medium">
          {uploading ? "Đang tải lên..." : "Kéo ảnh vào đây hoặc nhấn để chọn"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WEBP · Tối đa 5 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}

function QueuedUploader({ file, onChange }: QueuedProps) {
  const [error, setError] = useState<string | null>(null)

  function handleFile(selectedFile: File) {
    setError(null)
    if (!selectedFile.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh")
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Ảnh tối đa 5 MB")
      return
    }
    if (file) URL.revokeObjectURL(file.previewUrl)
    onChange({
      key: `${Date.now()}-${selectedFile.name}`,
      file: selectedFile,
      previewUrl: URL.createObjectURL(selectedFile),
    })
  }

  function removeFile() {
    if (file) URL.revokeObjectURL(file.previewUrl)
    onChange(null)
  }

  return (
    <div className="space-y-3">
      {file && (
        <div className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.previewUrl} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={removeFile}
            className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow group-hover:flex"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
      <DropZone onFile={handleFile} uploading={false} />
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
    </div>
  )
}

function ExistingUploader({ destinationId, imageUrl, onChange }: ExistingProps) {
  const [uploading, startUpload] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh tối đa 5 MB")
      return
    }

    const formData = new FormData()
    formData.append("destinationId", destinationId)
    formData.append("file", file)

    startUpload(async () => {
      try {
        const result = await uploadDestinationImage(formData)
        onChange(result.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload thất bại")
      }
    })
  }

  async function handleDelete() {
    if (!imageUrl) return
    setDeleting(true)
    setError(null)
    try {
      await deleteDestinationImage(destinationId, imageUrl)
      onChange(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa ảnh thất bại")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      {imageUrl && (
        <div className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          <Image src={imageUrl} alt="Destination" fill className="object-cover" sizes="420px" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow group-hover:flex"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      )}
      <DropZone onFile={handleFile} uploading={uploading} />
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
    </div>
  )
}

function ErrorMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function DestinationImageUploader(props: DestinationImageUploaderProps) {
  if (props.mode === "existing") {
    return <ExistingUploader {...props} />
  }
  return <QueuedUploader {...props} />
}

export async function uploadQueuedDestinationImage(
  destinationId: string,
  queuedFile: QueuedDestinationImage | null
) {
  if (!queuedFile) return null
  const formData = new FormData()
  formData.append("destinationId", destinationId)
  formData.append("file", queuedFile.file)
  return uploadDestinationImage(formData)
}
