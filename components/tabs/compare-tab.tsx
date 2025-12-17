"use client"

import { Card } from "@/components/ui/card"
import type { Dataset } from "@/app/page"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

interface CompareTabProps {
  datasets: Dataset[]
}

export function CompareTab({ datasets }: CompareTabProps) {
  if (datasets.length < 2) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Compare Datasets</h2>
          <p className="mt-1 text-sm text-zinc-400">Compare columns across multiple CSV files</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
            <AlertCircle className="h-10 w-10" />
            <p className="text-center text-sm">Upload at least 2 CSV files to compare their columns</p>
          </div>
        </Card>
      </div>
    )
  }

  // Get all unique columns across all datasets
  const allColumns = new Set<string>()
  datasets.forEach((dataset) => {
    dataset.columnNames.forEach((col) => allColumns.add(col))
  })

  // Build comparison matrix
  const comparisonData = Array.from(allColumns).map((column) => {
    const presence = datasets.map((dataset) => ({
      name: dataset.name,
      hasColumn: dataset.columnNames.includes(column),
    }))
    return { column, presence }
  })

  // Calculate statistics
  const commonColumns = comparisonData.filter((row) => row.presence.every((p) => p.hasColumn))
  const uniqueColumns = comparisonData.filter((row) => row.presence.filter((p) => p.hasColumn).length === 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Compare Datasets</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Comparing {datasets.length} CSV files with {allColumns.size} unique columns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-semibold text-zinc-100">{commonColumns.length}</p>
              <p className="text-xs text-zinc-400">Common Columns</p>
            </div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-semibold text-zinc-100">{uniqueColumns.length}</p>
              <p className="text-xs text-zinc-400">Unique Columns</p>
            </div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-semibold text-zinc-100">{allColumns.size}</p>
              <p className="text-xs text-zinc-400">Total Unique Columns</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Matrix */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Column Presence Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-3 pr-4 text-left text-sm font-medium text-zinc-400">Column Name</th>
                {datasets.map((dataset, idx) => (
                  <th key={idx} className="px-3 pb-3 text-center text-sm font-medium text-zinc-400">
                    {dataset.name.replace(".csv", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-b border-zinc-800/50">
                  <td className="py-3 pr-4 text-sm font-medium text-zinc-300">{row.column}</td>
                  {row.presence.map((p, pIdx) => (
                    <td key={pIdx} className="px-3 py-3 text-center">
                      {p.hasColumn ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-zinc-700" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Common Columns List */}
      {commonColumns.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Common Columns ({commonColumns.length})</h3>
          <div className="flex flex-wrap gap-2">
            {commonColumns.map((row, idx) => (
              <span
                key={idx}
                className="rounded-md bg-green-950/30 px-3 py-1 text-sm text-green-400 border border-green-900/50"
              >
                {row.column}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Unique Columns List */}
      {uniqueColumns.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Unique Columns ({uniqueColumns.length})</h3>
          <div className="space-y-2">
            {uniqueColumns.map((row, idx) => {
              const datasetWithColumn = row.presence.find((p) => p.hasColumn)
              return (
                <div key={idx} className="flex items-center justify-between rounded-md bg-zinc-950/50 px-3 py-2">
                  <span className="text-sm text-zinc-300">{row.column}</span>
                  <span className="text-xs text-zinc-500">Only in {datasetWithColumn?.name}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
