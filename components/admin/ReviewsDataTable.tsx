"use client"

import { Trash2, Star } from "lucide-react"
import {
  AdminDataTable,
  type Column,
  type RowAction,
  type TableFilter,
} from "@/components/admin/AdminDataTable"
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import { useState } from "react"
import { deleteReview } from "@/app/admin/reviews/actions"
import { formatDate } from "@/lib/format"

export interface ReviewRow {
  id: string
  tourTitle: string
  customer: string
  rating: number | null
  comment: string | null
  created_at: Date | null
}

function StarRating({ rating }: { rating: number | null }) {
  const r = rating ?? 0
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < r ? "text-amber-400 fill-amber-400" : "text-muted-foreground/25"}`}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium tabular-nums">{r}/5</span>
    </div>
  )
}

const COLUMNS: Column<ReviewRow>[] = [
  {
    key: "tour",
    header: "Tour",
    className: "pl-5 max-w-[180px]",
    render: (r) => <span className="block truncate font-medium text-foreground">{r.tourTitle}</span>,
  },
  {
    key: "customer",
    header: "Khách hàng",
    render: (r) => <span className="text-muted-foreground">{r.customer}</span>,
  },
  {
    key: "rating",
    header: "Điểm",
    render: (r) => <StarRating rating={r.rating} />,
  },
  {
    key: "comment",
    header: "Nhận xét",
    className: "max-w-[280px]",
    render: (r) => (
      <span className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
        {r.comment ?? "—"}
      </span>
    ),
  },
  {
    key: "date",
    header: "Ngày",
    className: "pr-4",
    render: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.created_at)}</span>,
  },
]

const FILTERS: TableFilter<ReviewRow>[] = [
  {
    key: "rating",
    label: "Điểm",
    allLabel: "Tất cả điểm",
    getValue: (row) => String(row.rating ?? 0),
    options: [
      { label: "5 sao", value: "5" },
      { label: "4 sao", value: "4" },
      { label: "3 sao", value: "3" },
      { label: "2 sao", value: "2" },
      { label: "1 sao", value: "1" },
      { label: "Chưa chấm", value: "0" },
    ],
  },
  {
    key: "comment",
    label: "Nhận xét",
    allLabel: "Tất cả nhận xét",
    getValue: (row) => (row.comment ? "has-comment" : "no-comment"),
    options: [
      { label: "Có nhận xét", value: "has-comment" },
      { label: "Không có nhận xét", value: "no-comment" },
    ],
  },
]

export function ReviewsDataTable({ data }: { data: ReviewRow[] }) {
  const [deleting, setDeleting] = useState<ReviewRow | null>(null)

  const actions: RowAction<ReviewRow>[] = [
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
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá đánh giá?"
        description={`Đánh giá của "${deleting?.customer}" cho tour "${deleting?.tourTitle}" sẽ bị xoá vĩnh viễn.`}
        onConfirm={async () => { if (deleting) await deleteReview(deleting.id) }}
      />
    </>
  )
}
