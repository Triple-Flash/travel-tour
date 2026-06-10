"use client"

import * as React from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreVertical, Search, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed:  { label: "Xác nhận",    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending:    { label: "Chờ xử lý",   className: "bg-amber-100  text-amber-700  border-amber-200  dark:bg-amber-900/30  dark:text-amber-400"  },
  cancelled:  { label: "Đã huỷ",      className: "bg-red-100    text-red-700    border-red-200    dark:bg-red-900/30    dark:text-red-400"    },
  completed:  { label: "Hoàn thành",  className: "bg-blue-100   text-blue-700   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400"   },
  admin:      { label: "Admin",       className: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400" },
  customer:   { label: "Khách hàng",  className: "bg-slate-100  text-slate-600  border-slate-200  dark:bg-slate-800     dark:text-slate-300"  },
  unknown:    { label: "Không rõ",    className: "bg-gray-100   text-gray-500   border-gray-200"  },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
      cfg.className
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

// ─── Column definition ────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  className?: string
  render: (row: T) => React.ReactNode
  /** Optional: custom string extractor for search. Defaults to row[key] as string. */
  searchValue?: (row: T) => string
}

// ─── Action menu ─────────────────────────────────────────────────────────────

export interface RowAction<T> {
  label: string
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  onClick: (row: T) => void
}

export interface TableFilter<T> {
  key: string
  label: string
  allLabel?: string
  options: { label: string; value: string }[]
  getValue: (row: T) => string | null | undefined
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

interface AdminDataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  actions?: RowAction<T>[]
  filters?: TableFilter<T>[]
  rowsPerPageOptions?: number[]
  defaultRowsPerPage?: number
  emptyMessage?: string
  searchPlaceholder?: string
}

export function AdminDataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  filters = [],
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  emptyMessage = "Không có dữ liệu",
  searchPlaceholder = "Tìm kiếm...",
}: AdminDataTableProps<T>) {
  const [page, setPage] = React.useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage)
  const [query, setQuery] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({})

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function updateFilter(key: string, value: string) {
    setActiveFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  function updateRowsPerPage(value: number) {
    setRowsPerPage(value)
    setPage(1)
  }

  const hasActiveFilters = filters.some((filter) => activeFilters[filter.key] && activeFilters[filter.key] !== "all")

  function clearFilters() {
    setActiveFilters({})
    setPage(1)
  }

  // ── Search + dropdown filtering ───────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter((row) => {
      const matchesSearch = !q || columns.some((col) => {
        const val = col.searchValue
          ? col.searchValue(row)
          : String((row as Record<string, unknown>)[col.key] ?? "")
        return val.toLowerCase().includes(q)
      })

      if (!matchesSearch) return false

      return filters.every((filter) => {
        const activeValue = activeFilters[filter.key]
        if (!activeValue || activeValue === "all") return true
        return filter.getValue(row) === activeValue
      })
    })
  }, [data, columns, query, filters, activeFilters])

  const totalRows  = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * rowsPerPage
  const visibleRows = filtered.slice(start, start + rowsPerPage)

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {query && (
            <button
              onClick={() => updateQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {filter.label}
            </span>
            <Select
              value={activeFilters[filter.key] ?? "all"}
              onValueChange={(value) => updateFilter(filter.key, value ?? "all")}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <span className="truncate">
                  {activeFilters[filter.key] && activeFilters[filter.key] !== "all"
                    ? filter.options.find((option) => option.value === activeFilters[filter.key])?.label
                    : filter.allLabel ?? `Tất cả ${filter.label.toLowerCase()}`}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  {filter.allLabel ?? `Tất cả ${filter.label.toLowerCase()}`}
                </SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
            Xóa lọc
          </Button>
        )}
        {(query || hasActiveFilters) && (
          <span className="text-xs text-muted-foreground shrink-0">
            {totalRows} kết quả
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  scope="col"
                  className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead scope="col" className="w-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {query ? `Không tìm thấy kết quả cho "${query}"` : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group border-b border-border/60 hover:bg-muted/40 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("py-3 text-sm", col.className)}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell className="py-3 text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger id={`row-action-${row.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Hành động</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuGroup>
                            {actions
                              .filter((a) => a.variant !== "destructive")
                              .map((action) => (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => action.onClick(row)}
                                >
                                  {action.icon && <span className="mr-2">{action.icon}</span>}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuGroup>
                          {actions.some((a) => a.variant === "destructive") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                {actions
                                  .filter((a) => a.variant === "destructive")
                                  .map((action) => (
                                    <DropdownMenuItem
                                      key={action.label}
                                      variant="destructive"
                                      onClick={() => action.onClick(row)}
                                    >
                                      {action.icon && <span className="mr-2">{action.icon}</span>}
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuGroup>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Hàng / trang</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => updateRowsPerPage(Number(v))}
          >
            <SelectTrigger id="dt-rows-per-page" className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs">
            {totalRows === 0 ? "0" : `${start + 1}–${Math.min(start + rowsPerPage, totalRows)}`} / {totalRows}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs">Trang {safePage} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 1} onClick={() => setPage(1)}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === totalPages} onClick={() => setPage(totalPages)}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
