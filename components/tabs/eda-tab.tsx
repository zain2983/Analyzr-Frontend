"use client"

import { Card } from "@/components/ui/card"
import type { Dataset } from "@/app/page"
import { DataTable } from "@/components/data-table"
import { AlertCircle, Database, Hash, FileText } from "lucide-react"
import { useState } from "react"

interface EDATabProps {
  datasets: Dataset[]
}

export function EDATab({ datasets }: EDATabProps) {
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0)

  if (datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Exploratory Data Analysis</h2>
          <p className="mt-1 text-sm text-zinc-400">Statistical summaries and data quality insights</p>
        </div>
        <Card className="border-zinc-800 bg-zinc-900 p-12">
          <div className="text-center">
            <Database className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-sm text-zinc-500">No dataset loaded. Upload a CSV file in the CSV Basics tab.</p>
          </div>
        </Card>
      </div>
    )
  }

  const dataset = datasets[selectedDatasetIndex]

  // TODO: Replace with actual API call to FastAPI backend
  // const response = await fetch(`/api/dataset/eda?name=${dataset.name}`)
  // const edaData = await response.json()

  // Mock EDA calculations
  const columnStats = dataset.columnNames.map((col) => {
    const values = dataset.data?.map((row) => row[col]) || []
    const uniqueCount = new Set(values.filter((v) => v)).size
    const nullCount = values.filter((v) => !v || v === "").length
    const sampleValues = values.slice(0, 3).join(", ")

    return {
      name: col,
      type: isNaN(Number(values[0])) ? "string" : "number",
      nullCount,
      uniqueCount,
      sample: sampleValues,
    }
  })

  const highNullColumns = columnStats.filter((col) => col.nullCount > dataset.rows * 0.1)
  const highCardinalityColumns = columnStats.filter((col) => col.uniqueCount > dataset.rows * 0.8)
  const totalNullPercentage = (
    (columnStats.reduce((sum, col) => sum + col.nullCount, 0) / (dataset.rows * dataset.columns)) *
    100
  ).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Exploratory Data Analysis</h2>
        <p className="mt-1 text-sm text-zinc-400">Statistical summaries and data quality insights</p>
      </div>

      {datasets.length > 1 && (
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">Select Dataset</label>
          <select
            value={selectedDatasetIndex}
            onChange={(e) => setSelectedDatasetIndex(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          >
            {datasets.map((ds, idx) => (
              <option key={idx} value={idx}>
                {ds.name} ({ds.rows} rows, {ds.columns} columns)
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Dataset Overview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Dataset Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-500/10 p-2">
                <Hash className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">{dataset.rows.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Total Rows</p>
              </div>
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-emerald-500/10 p-2">
                <FileText className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">{dataset.columns}</p>
                <p className="text-xs text-zinc-500">Total Columns</p>
              </div>
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-orange-500/10 p-2">
                <Database className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">
                  ~{Math.round((dataset.rows * dataset.columns) / 1024)}KB
                </p>
                <p className="text-xs text-zinc-500">Memory Usage</p>
              </div>
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-red-500/10 p-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">{totalNullPercentage}%</p>
                <p className="text-xs text-zinc-500">Null Values</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Column-Level Summary */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Column-Level Summary</h3>
        <Card className="border-zinc-800 bg-zinc-900">
          <DataTable
            headers={["Column Name", "Data Type", "Null Count", "Unique Count", "Sample Values"]}
            rows={columnStats.map((col) => [
              col.name,
              col.type,
              col.nullCount.toString(),
              col.uniqueCount.toString(),
              col.sample,
            ])}
          />
        </Card>
      </div>

      {/* Data Quality Insights */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Data Quality Insights</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <h4 className="text-sm font-medium text-zinc-300">High Null Columns</h4>
            <p className="mt-1 text-xs text-zinc-500">Columns with {">"} 10% null values</p>
            <div className="mt-3 space-y-1">
              {highNullColumns.length > 0 ? (
                highNullColumns.map((col) => (
                  <div key={col.name} className="text-sm text-zinc-400">
                    {col.name} ({((col.nullCount / dataset.rows) * 100).toFixed(1)}%)
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600">No issues detected</p>
              )}
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <h4 className="text-sm font-medium text-zinc-300">High Cardinality</h4>
            <p className="mt-1 text-xs text-zinc-500">Columns with {">"} 80% unique values</p>
            <div className="mt-3 space-y-1">
              {highCardinalityColumns.length > 0 ? (
                highCardinalityColumns.map((col) => (
                  <div key={col.name} className="text-sm text-zinc-400">
                    {col.name} ({col.uniqueCount} unique)
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600">No issues detected</p>
              )}
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <h4 className="text-sm font-medium text-zinc-300">Potential ID Columns</h4>
            <p className="mt-1 text-xs text-zinc-500">Likely identifier columns</p>
            <div className="mt-3 space-y-1">
              {highCardinalityColumns.length > 0 ? (
                highCardinalityColumns.slice(0, 3).map((col) => (
                  <div key={col.name} className="text-sm text-zinc-400">
                    {col.name}
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600">None detected</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
