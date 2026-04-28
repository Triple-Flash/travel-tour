import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { RecentTransaction } from "@/data/queries/bookings"
import { formatCurrency, formatDate } from "@/lib/format"

interface RecentTransactionsTableProps {
  data: RecentTransaction[]
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Badge variant="default" className="text-[11px]">Hoàn thành</Badge>
    case "pending":
      return <Badge variant="secondary" className="text-[11px]">Chờ thanh toán</Badge>
    case "cancelled":
      return <Badge variant="destructive" className="text-[11px]">Đã huỷ</Badge>
    default:
      return <Badge variant="outline" className="text-[11px]">{status}</Badge>
  }
}

export function RecentTransactionsTable({ data }: RecentTransactionsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Giao Dịch Gần Đây</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-6 text-xs">Tour</TableHead>
              <TableHead scope="col" className="text-xs">Khách hàng</TableHead>
              <TableHead scope="col" className="text-xs">Số tiền</TableHead>
              <TableHead scope="col" className="text-xs">Trạng thái</TableHead>
              <TableHead scope="col" className="pr-6 text-xs">Ngày</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                  Chưa có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((tx) => (
                <TableRow key={tx.bookingId} className="group">
                  <TableCell className="pl-6 font-medium text-sm max-w-[180px]">
                    <span className="truncate block">{tx.tourTitle}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.customerName}
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground tabular-nums">
                    {formatDate(tx.date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
