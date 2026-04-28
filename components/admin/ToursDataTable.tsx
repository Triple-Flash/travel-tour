"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, Plus, MapPin, Clock } from "lucide-react"
import { AdminDataTable, type Column, type RowAction } from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createTour, updateTour, deleteTour, type TourFormData } from "@/app/admin/tours/actions"
import { getTourImages } from "@/app/admin/tours/image-actions"
import {
  TourImageUploader,
  uploadQueuedFiles,
  type TourImage,
} from "@/components/admin/TourImageUploader"
import { formatCurrency } from "@/lib/format"

// QueuedFile type — mirrors what TourImageUploader exports internally
interface QueuedFile { key: string; file: File; previewUrl: string }

export interface TourRow {
  id: string
  title: string
  destinationName: string | null
  price: number
  duration: number
  max_capacity: number
  destination_id: string | null
  description: string | null
}

const COLUMNS: Column<TourRow>[] = [
  {
    key: "title",
    header: "Tên tour",
    className: "pl-5 max-w-[220px]",
    searchValue: (r) => r.title,
    render: (r) => <span className="block truncate font-medium text-foreground">{r.title}</span>,
  },
  {
    key: "destination",
    header: "Điểm đến",
    searchValue: (r) => r.destinationName ?? "",
    render: (r) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{r.destinationName ?? "—"}</span>
      </div>
    ),
  },
  {
    key: "price",
    header: "Giá",
    render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.price)}</span>,
  },
  {
    key: "duration",
    header: "Thời gian",
    render: (r) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{r.duration} ngày</span>
      </div>
    ),
  },
  {
    key: "capacity",
    header: "Sức chứa",
    className: "pr-4",
    render: (r) => <Badge variant="secondary" className="text-[11px]">{r.max_capacity} người</Badge>,
  },
]

const EMPTY_FORM: TourFormData = { title: "", description: "", price: 0, duration: 1, max_capacity: 10 }

export function ToursDataTable({ data }: { data: TourRow[] }) {
  // Dialog mode
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed")
  const [editingRow, setEditingRow] = useState<TourRow | null>(null)
  const [deleting, setDeleting] = useState<TourRow | null>(null)

  // Form state
  const [form, setForm] = useState<TourFormData>(EMPTY_FORM)
  const [pending, startTransition] = useTransition()

  // Image state
  // Create mode: queued local files
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  // Edit mode: existing DB images
  const [existingImages, setExistingImages] = useState<TourImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  // ── Open helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM)
    setQueuedFiles([])
    setMode("create")
  }

  function openEdit(row: TourRow) {
    setForm({
      title: row.title,
      description: row.description ?? "",
      price: row.price,
      duration: row.duration,
      max_capacity: row.max_capacity,
      destination_id: row.destination_id ?? undefined,
    })
    setEditingRow(row)
    setExistingImages([])
    setLoadingImages(true)
    setMode("edit")
    getTourImages(row.id).then((imgs) => {
      setExistingImages(imgs)
      setLoadingImages(false)
    })
  }

  function closeDialog() {
    setMode("closed")
    setEditingRow(null)
    setQueuedFiles([])
    setExistingImages([])
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    startTransition(async () => {
      if (mode === "edit" && editingRow) {
        await updateTour(editingRow.id, form)
        closeDialog()
      } else if (mode === "create") {
        // 1. Create tour, get new ID
        const newId = await createTour(form)
        // 2. Upload any queued images
        if (queuedFiles.length > 0) {
          await uploadQueuedFiles(newId, queuedFiles)
        }
        closeDialog()
      }
    })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const actions: RowAction<TourRow>[] = [
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: openEdit,
    },
    {
      label: "Xoá",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "destructive",
      onClick: (row) => setDeleting(row),
    },
  ]

  return (
    <>
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="text-sm font-medium">{data.length} tours</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm tour
        </Button>
      </div>

      <AdminDataTable data={data} columns={COLUMNS} actions={actions} />

      {/* Create / Edit dialog */}
      <Dialog open={mode !== "closed"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">
              {mode === "edit" ? "Chỉnh sửa tour" : "Thêm tour mới"}
            </div>
          </DialogHeader>

          {/* Form fields */}
          <div className="grid gap-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="tour-title">Tên tour *</Label>
              <Input
                id="tour-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Tour Đà Lạt 3 ngày 2 đêm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tour-desc">Mô tả</Label>
              <Textarea
                id="tour-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả tour..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tour-price">Giá (VND) *</Label>
                <Input
                  id="tour-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tour-duration">Số ngày *</Label>
                <Input
                  id="tour-duration"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tour-cap">Sức chứa *</Label>
                <Input
                  id="tour-cap"
                  type="number"
                  min={1}
                  value={form.max_capacity}
                  onChange={(e) => setForm({ ...form, max_capacity: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Image section */}
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Hình ảnh tour</p>
            {mode === "create" ? (
              // Create: queue local files — uploaded together when tour is saved
              <TourImageUploader
                mode="queued"
                files={queuedFiles}
                onChange={setQueuedFiles}
              />
            ) : editingRow ? (
              // Edit: live upload/delete against DB
              <TourImageUploader
                mode="existing"
                tourId={editingRow.id}
                images={existingImages}
                onChange={setExistingImages}
                loading={loadingImages}
              />
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>Huỷ</Button>
            <Button onClick={handleSubmit} disabled={pending || !form.title}>
              {pending
                ? (queuedFiles.length > 0 ? `Đang lưu & tải ${queuedFiles.length} ảnh...` : "Đang lưu...")
                : mode === "edit" ? "Cập nhật" : "Tạo tour"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá tour?"
        description={`Tour "${deleting?.title}" và tất cả dữ liệu liên quan sẽ bị xoá vĩnh viễn.`}
        onConfirm={async () => { if (deleting) await deleteTour(deleting.id) }}
      />
    </>
  )
}
