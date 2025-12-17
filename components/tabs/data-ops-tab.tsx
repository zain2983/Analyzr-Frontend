"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Dataset } from "@/app/page"
import { AlertCircle, List, Layers, Hash, Filter, SortAsc, BarChart3 } from "lucide-react"

interface DataOpsTabProps {
  datasets: Dataset[]
}

export function DataOpsTab({ datasets }: DataOpsTabProps) {
  const [selectedDataset, setSelectedDataset] = useState<number>(0)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [operation, setOperation] = useState<string>("")

  if (datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Data Operations</h2>
          <p className="mt-1 text-sm text-zinc-400">Simple point-and-click tools to explore your data</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
            <AlertCircle className="h-10 w-10" />
            <p className="text-center text-sm">Upload a CSV file to start using data operations</p>
          </div>
        </Card>
      </div>
    )
  }

  const currentDataset = datasets[selectedDataset]

  // Operation handlers
  const showDistinctValues = () => {
    if (!selectedColumn || !currentDataset.data) return

    const distinctValues = Array.from(new Set(currentDataset.data.map((row) => row[selectedColumn]))).filter(
      (val) => val !== undefined && val !== "",
    )

    setOperation("Distinct Values")
    setResult({
      type: "list",
      title: `Distinct values in "${selectedColumn}"`,
      count: distinctValues.length,
      values: distinctValues.slice(0, 100), // Show first 100
    })
  }

  const countDistinct = () => {
    if (!selectedColumn || !currentDataset.data) return

    const distinctCount = new Set(
      currentDataset.data.map((row) => row[selectedColumn]).filter((val) => val !== undefined && val !== ""),
    ).size

    setOperation("Count Distinct")
    setResult({
      type: "metric",
      title: `Count of distinct values in "${selectedColumn}"`,
      value: distinctCount,
    })
  }

  const showFrequencyDistribution = () => {
    if (!selectedColumn || !currentDataset.data) return

    const frequency: Record<string, number> = {}
    currentDataset.data.forEach((row) => {
      const value = row[selectedColumn]
      if (value !== undefined && value !== "") {
        frequency[value] = (frequency[value] || 0) + 1
      }
    })

    const sorted = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)

    setOperation("Frequency Distribution")
    setResult({
      type: "frequency",
      title: `Top 20 values in "${selectedColumn}"`,
      data: sorted,
    })
  }

  const groupByColumn = () => {
    if (!selectedColumn || !currentDataset.data) return

    const groups: Record<string, number> = {}
    currentDataset.data.forEach((row) => {
      const value = row[selectedColumn]
      if (value !== undefined && value !== "") {
        groups[value] = (groups[value] || 0) + 1
      }
    })

    setOperation("Group By")
    setResult({
      type: "groupby",
      title: `Records grouped by "${selectedColumn}"`,
      totalGroups: Object.keys(groups).length,
      data: Object.entries(groups).slice(0, 50),
    })
  }

  const findNullValues = () => {
    if (!selectedColumn || !currentDataset.data) return

    const nullCount = currentDataset.data.filter((row) => !row[selectedColumn] || row[selectedColumn] === "").length
    const percentage = ((nullCount / currentDataset.data.length) * 100).toFixed(2)

    setOperation("Find Null Values")
    setResult({
      type: "metric",
      title: `Null/Empty values in "${selectedColumn}"`,
      value: nullCount,
      subtitle: `${percentage}% of ${currentDataset.data.length} total rows`,
    })
  }

  const showColumnStats = () => {
    if (!selectedColumn || !currentDataset.data) return

    const values = currentDataset.data
      .map((row) => row[selectedColumn])
      .filter((val) => val !== undefined && val !== "")
    const isNumeric = values.every((val) => !isNaN(Number(val)))

    if (isNumeric) {
      const numbers = values.map(Number)
      const sum = numbers.reduce((a, b) => a + b, 0)
      const mean = sum / numbers.length
      const sorted = [...numbers].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]

      setOperation("Column Statistics")
      setResult({
        type: "stats",
        title: `Statistics for "${selectedColumn}"`,
        data: [
          { label: "Count", value: numbers.length },
          { label: "Mean", value: mean.toFixed(2) },
          { label: "Median", value: median.toFixed(2) },
          { label: "Min", value: Math.min(...numbers).toFixed(2) },
          { label: "Max", value: Math.max(...numbers).toFixed(2) },
        ],
      })
    } else {
      setOperation("Column Statistics")
      setResult({
        type: "stats",
        title: `Statistics for "${selectedColumn}"`,
        data: [
          { label: "Total Values", value: values.length },
          { label: "Unique Values", value: new Set(values).size },
          {
            label: "Most Common",
            value:
              Object.entries(
                values.reduce((acc: Record<string, number>, val) => {
                  acc[val] = (acc[val] || 0) + 1
                  return acc
                }, {}),
              ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A",
          },
        ],
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Data Operations</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Simple point-and-click tools to explore your data - no coding required
        </p>
      </div>

      {/* Dataset and Column Selection */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">Select Dataset</label>
          <select
            value={selectedDataset}
            onChange={(e) => {
              setSelectedDataset(Number(e.target.value))
              setSelectedColumn("")
              setResult(null)
            }}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          >
            {datasets.map((dataset, idx) => (
              <option key={idx} value={idx}>
                {dataset.name} ({dataset.rows} rows, {dataset.columns} columns)
              </option>
            ))}
          </select>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">Select Column</label>
          <select
            value={selectedColumn}
            onChange={(e) => {
              setSelectedColumn(e.target.value)
              setResult(null)
            }}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose a column...</option>
            {currentDataset.columnNames.map((col, idx) => (
              <option key={idx} value={col}>
                {col}
              </option>
            ))}
          </select>
        </Card>
      </div>

      {/* Operations Grid */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Available Operations</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            onClick={showDistinctValues}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <List className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-zinc-100">Show Distinct Values</p>
              <p className="text-xs text-zinc-400">List all unique values in the column</p>
            </div>
          </Button>

          <Button
            onClick={countDistinct}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <Hash className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-zinc-100">Count Distinct</p>
              <p className="text-xs text-zinc-400">Count how many unique values exist</p>
            </div>
          </Button>

          <Button
            onClick={showFrequencyDistribution}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium text-zinc-100">Frequency Distribution</p>
              <p className="text-xs text-zinc-400">See how often each value appears</p>
            </div>
          </Button>

          <Button
            onClick={groupByColumn}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <Layers className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium text-zinc-100">Group By</p>
              <p className="text-xs text-zinc-400">Group records by column values</p>
            </div>
          </Button>

          <Button
            onClick={findNullValues}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <Filter className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-zinc-100">Find Null Values</p>
              <p className="text-xs text-zinc-400">Identify missing or empty data</p>
            </div>
          </Button>

          <Button
            onClick={showColumnStats}
            disabled={!selectedColumn}
            className="h-auto flex-col items-start gap-2 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
          >
            <SortAsc className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="font-medium text-zinc-100">Column Statistics</p>
              <p className="text-xs text-zinc-400">Calculate basic stats (mean, median, etc.)</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Results Display */}
      {result && (
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-100">{operation} Results</h3>
            <Button
              onClick={() => setResult(null)}
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-100"
            >
              Clear
            </Button>
          </div>

          <div className="rounded-md bg-zinc-950 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-300">{result.title}</p>

            {result.type === "metric" && (
              <div>
                <p className="text-3xl font-bold text-zinc-100">{result.value}</p>
                {result.subtitle && <p className="mt-1 text-sm text-zinc-400">{result.subtitle}</p>}
              </div>
            )}

            {result.type === "list" && (
              <div>
                <p className="mb-2 text-sm text-zinc-400">
                  Showing {result.values.length} of {result.count} distinct values
                </p>
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {result.values.map((value: string, idx: number) => (
                    <div key={idx} className="rounded bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.type === "frequency" && (
              <div className="space-y-2">
                {result.data.map(([value, count]: [string, number], idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{value}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(count / result.data[0][1]) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-zinc-400">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.type === "groupby" && (
              <div>
                <p className="mb-2 text-sm text-zinc-400">{result.totalGroups} unique groups found</p>
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {result.data.map(([value, count]: [string, number], idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded bg-zinc-900 px-3 py-2">
                      <span className="text-sm text-zinc-300">{value}</span>
                      <span className="text-sm font-medium text-zinc-400">{count} records</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.type === "stats" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.map((stat: { label: string; value: any }, idx: number) => (
                  <div key={idx} className="rounded bg-zinc-900 p-3">
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-100">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
