"use client"

import { useState, useTransition } from "react"
import { BadgePercent, CalendarClock, Pencil, Plus, Trash2 } from "lucide-react"
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
import {
  createVoucher,
  deleteVoucher,
  updateVoucher,
  type VoucherFormData,
} from "@/app/admin/vouchers/actions"
import { formatDate } from "@/lib/format"

export interface VoucherRow {
  id: string
  code: string
  discount_percentage: number
  expiration_date: Date | null
}

const EMPTY_FORM: VoucherFormData = {
  code: "",
  discount_percentage: 10,
  expiration_date: "",
}

function toDateInputValue(date: Date | null) {
  if (!date) return ""
  return new Date(date).toISOString().slice(0, 10)
}

function isExpired(date: Date | null) {
  return !!date && new Date(date).getTime() < Date.now()
}

const COLUMNS: Column<VoucherRow>[] = [
  {
    key: "code",
    header: "Mã voucher",
    className: "pl-5",
    searchValue: (row) => row.code,
    render: (row) => <span className="font-mono font-semibold text-foreground">{row.code}</span>,
  },
  {
    key: "discount",
    header: "Giảm giá",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <BadgePercent className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{row.discount_percentage}%</span>
      </div>
    ),
  },
  {
    key: "expiration",
    header: "Ngày hết hạn",
    searchValue: (row) => formatDate(row.expiration_date),
    render: (row) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" />
        <span>{row.expiration_date ? formatDate(row.expiration_date) : "Không giới hạn"}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    className: "pr-4",
    render: (row) => (
      <span
        className={
          isExpired(row.expiration_date)
            ? "inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700"
            : "inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
        }
      >
        {isExpired(row.expiration_date) ? "Hết hạn" : "Đang dùng"}
      </span>
    ),
  },
]

const FILTERS: TableFilter<VoucherRow>[] = [
  {
    key: "status",
    label: "Trạng thái",
    allLabel: "Tất cả trạng thái",
    getValue: (row) => (isExpired(row.expiration_date) ? "expired" : "active"),
    options: [
      { label: "Đang dùng", value: "active" },
      { label: "Hết hạn", value: "expired" },
    ],
  },
  {
    key: "expiration",
    label: "Thời hạn",
    allLabel: "Tất cả thời hạn",
    getValue: (row) => (row.expiration_date ? "dated" : "unlimited"),
    options: [
      { label: "Có ngày hết hạn", value: "dated" },
      { label: "Không giới hạn", value: "unlimited" },
    ],
  },
]

export function VouchersDataTable({ data }: { data: VoucherRow[] }) {
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed")
  const [editing, setEditing] = useState<VoucherRow | null>(null)
  const [deleting, setDeleting] = useState<VoucherRow | null>(null)
  const [form, setForm] = useState<VoucherFormData>(EMPTY_FORM)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setMode("create")
  }

  function openEdit(row: VoucherRow) {
    setForm({
      code: row.code,
      discount_percentage: row.discount_percentage,
      expiration_date: toDateInputValue(row.expiration_date),
    })
    setEditing(row)
    setMode("edit")
  }

  function closeDialog() {
    setMode("closed")
    setEditing(null)
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discount_percentage: Math.min(100, Math.max(1, form.discount_percentage)),
      }

      if (mode === "edit" && editing) {
        await updateVoucher(editing.id, payload)
      } else if (mode === "create") {
        await createVoucher(payload)
      }
      closeDialog()
    })
  }

  const actions: RowAction<VoucherRow>[] = [
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
        <p className="text-sm font-medium">{data.length} voucher</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm voucher
        </Button>
      </div>

      <AdminDataTable data={data} columns={COLUMNS} actions={actions} filters={FILTERS} />

      <Dialog open={mode !== "closed"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">
              {mode === "edit" ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="voucher-code">Mã voucher *</Label>
              <Input
                id="voucher-code"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                placeholder="VD: SUMMER20"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="voucher-discount">Phần trăm giảm *</Label>
                <Input
                  id="voucher-discount"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount_percentage}
                  onChange={(event) =>
                    setForm({ ...form, discount_percentage: Number(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="voucher-expiration">Ngày hết hạn</Label>
                <Input
                  id="voucher-expiration"
                  type="date"
                  value={form.expiration_date}
                  onChange={(event) => setForm({ ...form, expiration_date: event.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={pending || !form.code || form.discount_percentage < 1}
            >
              {pending ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Tạo voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa voucher?"
        description={`Voucher "${deleting?.code}" sẽ bị xóa vĩnh viễn.`}
        onConfirm={async () => {
          if (deleting) await deleteVoucher(deleting.id)
        }}
      />
    </>
  )
}
