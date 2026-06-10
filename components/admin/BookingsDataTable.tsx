"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import {
  AdminDataTable,
  StatusBadge,
  type Column,
  type RowAction,
  type TableFilter,
} from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteBooking, updateBookingStatus } from "@/app/admin/bookings/actions"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface BookingRow {
  id: string
  tourTitle: string
  customer: string
  people: number
  totalPrice: number
  status: string
  paymentStatus: string
  date: Date | null
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  },
  completed: {
    label: "Đã thanh toán",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  },
  unknown: {
    label: "Chưa có thông tin",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.unknown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        config.className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}

const COLUMNS: Column<BookingRow>[] = [
  {
    key: "tour",
    header: "Tour",
    className: "pl-5 max-w-[180px]",
    searchValue: (r) => r.tourTitle,
    render: (r) => (
      <span className="block truncate font-medium text-foreground">{r.tourTitle}</span>
    ),
  },
  {
    key: "customer",
    header: "Khách hàng",
    searchValue: (r) => r.customer,
    render: (r) => <span className="text-muted-foreground">{r.customer}</span>,
  },
  {
    key: "people",
    header: "Người",
    className: "text-center w-16",
    render: (r) => <span className="text-center block">{r.people}</span>,
  },
  {
    key: "price",
    header: "Tổng tiền",
    render: (r) => (
      <span className="tabular-nums font-medium">{formatCurrency(r.totalPrice)}</span>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    searchValue: (r) => r.status,
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "payment",
    header: "Thanh toán",
    searchValue: (r) => r.paymentStatus,
    render: (r) => <PaymentStatusBadge status={r.paymentStatus} />,
  },
  {
    key: "date",
    header: "Ngày đặt",
    className: "pr-4",
    render: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.date)}</span>,
  },
]

const FILTERS: TableFilter<BookingRow>[] = [
  {
    key: "status",
    label: "Trạng thái",
    allLabel: "Tất cả trạng thái",
    getValue: (row) => row.status,
    options: [
      { label: "Chờ xử lý", value: "pending" },
      { label: "Xác nhận", value: "confirmed" },
      { label: "Hoàn thành", value: "completed" },
      { label: "Đã hủy", value: "cancelled" },
      { label: "Không rõ", value: "unknown" },
    ],
  },
  {
    key: "payment",
    label: "Thanh toán",
    allLabel: "Tất cả thanh toán",
    getValue: (row) => row.paymentStatus,
    options: [
      { label: "Chờ thanh toán", value: "pending" },
      { label: "Đã thanh toán", value: "completed" },
      { label: "Đã hủy", value: "cancelled" },
      { label: "Chưa có thông tin", value: "unknown" },
    ],
  },
]

export function BookingsDataTable({ data }: { data: BookingRow[] }) {
  const [editing, setEditing] = useState<BookingRow | null>(null)
  const [deleting, setDeleting] = useState<BookingRow | null>(null)
  const [newStatus, setNewStatus] = useState("")

  const actions: RowAction<BookingRow>[] = [
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (row) => { setEditing(row); setNewStatus(row.status) },
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
      <AdminDataTable data={data} columns={COLUMNS} actions={actions} filters={FILTERS} />

      {/* Edit status dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">Cập nhật trạng thái đơn hàng</div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-medium truncate">{editing?.tourTitle}</p>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã huỷ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button
              onClick={async () => {
                if (editing) {
                  await updateBookingStatus(editing.id, newStatus)
                  setEditing(null)
                }
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá đơn hàng?"
        description={`Đơn tour "${deleting?.tourTitle}" sẽ bị xoá vĩnh viễn và không thể khôi phục.`}
        onConfirm={async () => {
          if (deleting) await deleteBooking(deleting.id)
        }}
      />
    </>
  )
}
