import { Card } from "@/components/ui/card"
import type { Dataset } from "@/app/page"
import { FileText, Table2, Columns } from "lucide-react"

interface DatasetSummaryProps {
  dataset: Dataset
}

export function DatasetSummary({ dataset }: DatasetSummaryProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      {/* Header */}
      <h3 className="mb-4 text-base font-semibold text-zinc-100 sm:text-lg">
        Dataset Summary
      </h3>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Dataset Name */}
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-blue-500/10 p-2">
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Dataset Name</p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-200">
              {dataset.name}
            </p>
          </div>
        </div>

        {/* Total Rows */}
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-emerald-500/10 p-2">
            <Table2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Rows</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">
              {dataset.rows.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Columns */}
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-orange-500/10 p-2">
            <Columns className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Columns</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">
              {dataset.columns}
            </p>
          </div>
        </div>
      </div>

      {/* Column Names */}
      <div className="mt-6">
        <p className="mb-2 text-xs text-zinc-500">Column Names</p>
        <div className="max-h-40 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-3">
          <div className="flex flex-wrap gap-2">
            {dataset.columnNames.map((col, idx) => (
              <span
                key={idx}
                className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
