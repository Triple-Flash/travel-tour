"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AdminDataTable,
  StatusBadge,
  type Column,
  type TableFilter,
} from "@/components/admin/AdminDataTable"
import type { RecentTransaction } from "@/data/queries/bookings"
import { formatCurrency, formatDate } from "@/lib/format"
import { ArrowUpRight } from "lucide-react"

interface RecentTransactionsTableProps {
  data: RecentTransaction[]
}

interface TxRow extends RecentTransaction { id: string }

const COLUMNS: Column<TxRow>[] = [
  {
    key: "tour",
    header: "Tour",
    className: "pl-5 max-w-[180px]",
    render: (r) => <span className="block truncate font-medium text-foreground">{r.tourTitle}</span>,
  },
  {
    key: "customer",
    header: "Khách hàng",
    render: (r) => <span className="text-muted-foreground">{r.customerName}</span>,
  },
  {
    key: "amount",
    header: "Số tiền",
    render: (r) => (
      <span className="tabular-nums font-semibold text-foreground">{formatCurrency(r.amount)}</span>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "date",
    header: "Ngày",
    className: "pr-4",
    render: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.date)}</span>,
  },
]

const FILTERS: TableFilter<TxRow>[] = [
  {
    key: "status",
    label: "Trạng thái",
    allLabel: "Tất cả trạng thái",
    getValue: (row) => row.status,
    options: [
      { label: "Hoàn thành", value: "completed" },
      { label: "Chờ xử lý", value: "pending" },
      { label: "Đã hủy", value: "cancelled" },
      { label: "Không rõ", value: "unknown" },
    ],
  },
]

export function RecentTransactionsTable({ data }: RecentTransactionsTableProps) {
  // AdminDataTable needs id field
  const rows: TxRow[] = data.map((tx) => ({ ...tx, id: tx.bookingId }))

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Giao Dịch Gần Đây</CardTitle>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <AdminDataTable
          data={rows}
          columns={COLUMNS}
          filters={FILTERS}
          defaultRowsPerPage={10}
          emptyMessage="Chưa có giao dịch nào"
        />
      </CardContent>
    </Card>
  )
}
