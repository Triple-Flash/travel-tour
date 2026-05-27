"use client"

import { useState, useTransition } from "react"
import { ImageIcon, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import { AdminDataTable, type Column, type RowAction } from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createDestination,
  deleteDestination,
  updateDestination,
  type DestinationFormData,
} from "@/app/admin/destinations/actions"
import {
  DestinationImageUploader,
  uploadQueuedDestinationImage,
  type QueuedDestinationImage,
} from "@/components/admin/DestinationImageUploader"

export interface DestinationRow {
  id: string
  name: string
  country: string
  description: string | null
  image_url: string | null
  tourCount: number
}

const EMPTY_FORM: DestinationFormData = {
  name: "",
  country: "Việt Nam",
  description: "",
}

const COLUMNS: Column<DestinationRow>[] = [
  {
    key: "name",
    header: "Điểm đến",
    className: "pl-5 max-w-[260px]",
    searchValue: (row) => `${row.name} ${row.country}`,
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{row.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {row.country}
        </p>
      </div>
    ),
  },
  {
    key: "description",
    header: "Mô tả",
    className: "max-w-[360px]",
    searchValue: (row) => row.description ?? "",
    render: (row) => (
      <span className="line-clamp-2 text-muted-foreground">
        {row.description ?? "Chưa có mô tả"}
      </span>
    ),
  },
  {
    key: "image",
    header: "Ảnh",
    render: (row) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        <span>{row.image_url ? "Có ảnh" : "Chưa có"}</span>
      </div>
    ),
  },
  {
    key: "tours",
    header: "Số tour",
    className: "pr-4 text-center",
    render: (row) => <span className="block text-center font-medium">{row.tourCount}</span>,
  },
]

export function DestinationsDataTable({ data }: { data: DestinationRow[] }) {
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed")
  const [editing, setEditing] = useState<DestinationRow | null>(null)
  const [deleting, setDeleting] = useState<DestinationRow | null>(null)
  const [form, setForm] = useState<DestinationFormData>(EMPTY_FORM)
  const [queuedImage, setQueuedImage] = useState<QueuedDestinationImage | null>(null)
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setForm(EMPTY_FORM)
    setQueuedImage(null)
    setEditingImageUrl(null)
    setEditing(null)
    setMode("create")
  }

  function openEdit(row: DestinationRow) {
    setForm({
      name: row.name,
      country: row.country,
      description: row.description ?? "",
    })
    setQueuedImage(null)
    setEditingImageUrl(row.image_url)
    setEditing(row)
    setMode("edit")
  }

  function closeDialog() {
    setMode("closed")
    setEditing(null)
    if (queuedImage) URL.revokeObjectURL(queuedImage.previewUrl)
    setQueuedImage(null)
    setEditingImageUrl(null)
  }

  function handleSubmit() {
    startTransition(async () => {
      if (mode === "edit" && editing) {
        await updateDestination(editing.id, form)
      } else if (mode === "create") {
        const destinationId = await createDestination(form)
        await uploadQueuedDestinationImage(destinationId, queuedImage)
      }
      closeDialog()
    })
  }

  const actions: RowAction<DestinationRow>[] = [
    { label: "Chỉnh sửa", icon: <Pencil className="h-3.5 w-3.5" />, onClick: openEdit },
    {
      label: "Xóa",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "destructive",
      onClick: (row) => setDeleting(row),
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="text-sm font-medium">{data.length} điểm đến</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm điểm đến
        </Button>
      </div>

      <AdminDataTable data={data} columns={COLUMNS} actions={actions} />

      <Dialog open={mode !== "closed"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">
              {mode === "edit" ? "Chỉnh sửa điểm đến" : "Thêm điểm đến mới"}
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="destination-name">Tên điểm đến *</Label>
                <Input
                  id="destination-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="VD: Hội An"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination-country">Quốc gia *</Label>
                <Input
                  id="destination-country"
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value })}
                  placeholder="VD: Việt Nam"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Hình ảnh điểm đến</p>
              {mode === "create" ? (
                <DestinationImageUploader
                  mode="queued"
                  file={queuedImage}
                  onChange={setQueuedImage}
                />
              ) : editing ? (
                <DestinationImageUploader
                  mode="existing"
                  destinationId={editing.id}
                  imageUrl={editingImageUrl}
                  onChange={setEditingImageUrl}
                />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="destination-description">Mô tả</Label>
              <Textarea
                id="destination-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={4}
                placeholder="Mô tả ngắn về điểm đến..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={pending || !form.name || !form.country}>
              {pending
                ? queuedImage
                  ? "Đang lưu và tải ảnh..."
                  : "Đang lưu..."
                : mode === "edit"
                  ? "Cập nhật"
                  : "Tạo điểm đến"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa điểm đến?"
        description={`Điểm đến "${deleting?.name}" và các tour liên quan sẽ bị xóa vĩnh viễn.`}
        onConfirm={async () => {
          if (deleting) await deleteDestination(deleting.id)
        }}
      />
    </>
  )
}
