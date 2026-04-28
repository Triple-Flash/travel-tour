"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { AdminDataTable, StatusBadge, type Column, type RowAction } from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { updateUser, updateUserRole, deleteUser } from "@/app/admin/users/actions"
import { formatDate } from "@/lib/format"

export interface UserRow {
  id: string
  full_name: string | null
  email: string
  role: string | null
  phone_number: string | null
  bookingCount: number
  created_at: Date | null
}

const COLUMNS: Column<UserRow>[] = [
  {
    key: "user",
    header: "Người dùng",
    className: "pl-5",
    searchValue: (r) => `${r.full_name ?? ""} ${r.email}`,
    render: (r) => {
      const initials = (r.full_name ?? r.email)
        .split(" ").slice(-2).map((s) => s[0]).join("").toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-[11px] font-semibold bg-muted text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{r.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{r.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    key: "role",
    header: "Vai trò",
    searchValue: (r) => r.role ?? "",
    render: (r) => <StatusBadge status={r.role ?? "customer"} />,
  },
  {
    key: "phone",
    header: "Điện thoại",
    searchValue: (r) => r.phone_number ?? "",
    render: (r) => <span className="text-muted-foreground">{r.phone_number ?? "—"}</span>,
  },
  {
    key: "bookings",
    header: "Đơn đặt",
    className: "text-center w-20",
    render: (r) => <span className="block text-center">{r.bookingCount}</span>,
  },
  {
    key: "date",
    header: "Tham gia",
    className: "pr-4",
    render: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.created_at)}</span>,
  },
]

interface EditForm { full_name: string; phone_number: string; role: string }

export function UsersDataTable({ data }: { data: UserRow[] }) {
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState<UserRow | null>(null)
  const [form, setForm] = useState<EditForm>({ full_name: "", phone_number: "", role: "customer" })
  const [pending, startTransition] = useTransition()

  function openEdit(row: UserRow) {
    setForm({
      full_name: row.full_name ?? "",
      phone_number: row.phone_number ?? "",
      role: row.role ?? "customer",
    })
    setEditing(row)
  }

  function handleSubmit() {
    if (!editing) return
    startTransition(async () => {
      await Promise.all([
        updateUser(editing.id, { full_name: form.full_name, phone_number: form.phone_number }),
        form.role !== editing.role ? updateUserRole(editing.id, form.role) : Promise.resolve(),
      ])
      setEditing(null)
    })
  }

  const actions: RowAction<UserRow>[] = [
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
      <AdminDataTable data={data} columns={COLUMNS} actions={actions} />

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="text-lg font-semibold tracking-tight">Chỉnh sửa người dùng</div>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Họ và tên</Label>
              <Input
                id="u-name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-phone">Số điện thoại</Label>
              <Input
                id="u-phone"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+84..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? "customer" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>Huỷ</Button>
            <Button onClick={handleSubmit} disabled={pending || !form.full_name}>
              {pending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá người dùng?"
        description={`Tài khoản "${deleting?.full_name ?? deleting?.email}" và tất cả dữ liệu sẽ bị xoá vĩnh viễn.`}
        onConfirm={async () => { if (deleting) await deleteUser(deleting.id) }}
      />
    </>
  )
}
