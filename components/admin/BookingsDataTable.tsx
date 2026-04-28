"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { AdminDataTable, StatusBadge, type Column, type RowAction } from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteBooking, updateBookingStatus } from "@/app/admin/bookings/actions"
import { formatCurrency, formatDate } from "@/lib/format"

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
    render: (r) => <StatusBadge status={r.paymentStatus} />,
  },
  {
    key: "date",
    header: "Ngày đặt",
    className: "pr-4",
    render: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.date)}</span>,
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
      <AdminDataTable data={data} columns={COLUMNS} actions={actions} />

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
