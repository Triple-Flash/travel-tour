"use client"

import { useState, useTransition } from "react"
import { Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import {
  AdminDataTable,
  type Column,
  type RowAction,
  type TableFilter,
} from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { createTour, deleteTour, updateTour, type TourFormData } from "@/app/admin/tours/actions"
import { getTourImages } from "@/app/admin/tours/image-actions"
import {
  TourImageUploader,
  uploadQueuedFiles,
  type TourImage,
} from "@/components/admin/TourImageUploader"
import { formatCurrency } from "@/lib/format"

interface QueuedFile {
  key: string
  file: File
  previewUrl: string
}

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

export interface DestinationOption {
  id: string
  name: string
  country: string
}

const COLUMNS: Column<TourRow>[] = [
  {
    key: "title",
    header: "Tên tour",
    className: "pl-5 max-w-[220px]",
    searchValue: (row) => row.title,
    render: (row) => (
      <span className="block truncate font-medium text-foreground">{row.title}</span>
    ),
  },
  {
    key: "destination",
    header: "Điểm đến",
    searchValue: (row) => row.destinationName ?? "",
    render: (row) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{row.destinationName ?? "Chưa chọn"}</span>
      </div>
    ),
  },
  {
    key: "price",
    header: "Giá",
    render: (row) => <span className="tabular-nums font-medium">{formatCurrency(row.price)}</span>,
  },
  {
    key: "duration",
    header: "Thời gian",
    render: (row) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{row.duration} ngày</span>
      </div>
    ),
  },
  {
    key: "capacity",
    header: "Sức chứa",
    className: "pr-4",
    render: (row) => (
      <Badge variant="secondary" className="text-[11px]">
        {row.max_capacity} người
      </Badge>
    ),
  },
]

const EMPTY_FORM: TourFormData = {
  title: "",
  description: "",
  price: 0,
  duration: 1,
  max_capacity: 10,
  destination_id: undefined,
}

export function ToursDataTable({
  data,
  destinations,
}: {
  data: TourRow[]
  destinations: DestinationOption[]
}) {
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed")
  const [editingRow, setEditingRow] = useState<TourRow | null>(null)
  const [deleting, setDeleting] = useState<TourRow | null>(null)
  const [form, setForm] = useState<TourFormData>(EMPTY_FORM)
  const [pending, startTransition] = useTransition()
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  const [existingImages, setExistingImages] = useState<TourImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const tableData = data.map((row) => {
    const destination = destinations.find(
      (item) => item.id === row.destination_id || item.id === row.destinationName
    )

    return {
      ...row,
      destinationName: destination
        ? `${destination.name}, ${destination.country}`
        : row.destinationName,
    }
  })
  const selectedDestination = destinations.find((item) => item.id === form.destination_id)
  const selectedDestinationLabel = selectedDestination
    ? `${selectedDestination.name}, ${selectedDestination.country}`
    : "Chưa chọn"
  const filters: TableFilter<TourRow>[] = [
    {
      key: "destination",
      label: "Điểm đến",
      allLabel: "Tất cả điểm đến",
      getValue: (row) => row.destination_id ?? "none",
      options: [
        { label: "Chưa chọn", value: "none" },
        ...destinations.map((destination) => ({
          label: `${destination.name}, ${destination.country}`,
          value: destination.id,
        })),
      ],
    },
    {
      key: "capacity",
      label: "Sức chứa",
      allLabel: "Tất cả sức chứa",
      getValue: (row) => {
        if (row.max_capacity <= 5) return "small"
        if (row.max_capacity <= 15) return "medium"
        return "large"
      },
      options: [
        { label: "Nhóm nhỏ (≤ 5)", value: "small" },
        { label: "Nhóm vừa (6-15)", value: "medium" },
        { label: "Nhóm lớn (> 15)", value: "large" },
      ],
    },
  ]

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
    getTourImages(row.id).then((images) => {
      setExistingImages(images)
      setLoadingImages(false)
    })
  }

  function closeDialog() {
    setMode("closed")
    setEditingRow(null)
    setQueuedFiles([])
    setExistingImages([])
  }

  function handleSubmit() {
    startTransition(async () => {
      if (mode === "edit" && editingRow) {
        await updateTour(editingRow.id, form)
        closeDialog()
      } else if (mode === "create") {
        const newId = await createTour(form)
        if (queuedFiles.length > 0) {
          await uploadQueuedFiles(newId, queuedFiles)
        }
        closeDialog()
      }
    })
  }

  const actions: RowAction<TourRow>[] = [
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: openEdit,
    },
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
        <p className="text-sm font-medium">{data.length} tours</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm tour
        </Button>
      </div>

      <AdminDataTable data={tableData} columns={COLUMNS} actions={actions} filters={filters} />

      <Dialog open={mode !== "closed"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">
              {mode === "edit" ? "Chỉnh sửa tour" : "Thêm tour mới"}
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="tour-title">Tên tour *</Label>
              <Input
                id="tour-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="VD: Tour Đà Lạt 3 ngày 2 đêm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tour-destination">Điểm đến</Label>
              <Select
                value={form.destination_id ?? "none"}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    destination_id: value === "none" ? undefined : value ?? undefined,
                  })
                }
              >
                <SelectTrigger id="tour-destination" className="w-full">
                  <span className="truncate">{selectedDestinationLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa chọn</SelectItem>
                  {destinations.map((destination) => (
                    <SelectItem key={destination.id} value={destination.id}>
                      {destination.name}, {destination.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tour-desc">Mô tả</Label>
              <Textarea
                id="tour-desc"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
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
                  onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tour-duration">Số ngày *</Label>
                <Input
                  id="tour-duration"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tour-cap">Sức chứa *</Label>
                <Input
                  id="tour-cap"
                  type="number"
                  min={1}
                  value={form.max_capacity}
                  onChange={(event) =>
                    setForm({ ...form, max_capacity: Number(event.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Hình ảnh tour</p>
            {mode === "create" ? (
              <TourImageUploader mode="queued" files={queuedFiles} onChange={setQueuedFiles} />
            ) : editingRow ? (
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
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={pending || !form.title}>
              {pending
                ? queuedFiles.length > 0
                  ? `Đang lưu và tải ${queuedFiles.length} ảnh...`
                  : "Đang lưu..."
                : mode === "edit"
                  ? "Cập nhật"
                  : "Tạo tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa tour?"
        description={`Tour "${deleting?.title}" và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.`}
        onConfirm={async () => {
          if (deleting) await deleteTour(deleting.id)
        }}
      />
    </>
  )
}
