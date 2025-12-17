"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import type { Dataset } from "@/app/page"
import { Database } from "lucide-react"
import { ChartContainer } from "@/components/chart-container"

interface VisualizationsTabProps {
  datasets: Dataset[]
}

type ChartType = "bar" | "histogram" | "pie"

export function VisualizationsTab({ datasets }: VisualizationsTabProps) {
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [chartType, setChartType] = useState<ChartType>("bar")

  const dataset = datasets.length > 0 ? datasets[selectedDatasetIndex] : null

  useEffect(() => {
    if (dataset && dataset.columnNames.length > 0 && !selectedColumn) {
      setSelectedColumn(dataset.columnNames[0])
    }
  }, [dataset, selectedColumn])

  useEffect(() => {
    if (dataset && dataset.columnNames.length > 0) {
      setSelectedColumn(dataset.columnNames[0])
    }
  }, [selectedDatasetIndex, dataset])

  if (!dataset) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Visualizations</h2>
          <p className="mt-1 text-sm text-zinc-400">Visual exploration of data distributions</p>
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

  // TODO: Replace with actual API call to FastAPI backend
  // const response = await fetch(`/api/dataset/visualization?column=${selectedColumn}&type=${chartType}`)
  // const vizData = await response.json()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Visualizations</h2>
        <p className="mt-1 text-sm text-zinc-400">Visual exploration of data distributions</p>
      </div>

      {/* Visualization Controls */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.length > 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Select Dataset</label>
              <select
                value={selectedDatasetIndex}
                onChange={(e) => setSelectedDatasetIndex(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              >
                {datasets.map((ds, idx) => (
                  <option key={idx} value={idx}>
                    {ds.name} ({ds.rows} rows, {ds.columns} columns)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Select Column</label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            >
              {dataset.columnNames.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            >
              <option value="bar">Bar Chart</option>
              <option value="histogram">Histogram</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Chart Display */}
      <ChartContainer dataset={dataset} column={selectedColumn} chartType={chartType} />
    </div>
  )
}
