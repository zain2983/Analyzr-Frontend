"use client"

import { useState } from "react"
import type { Dataset } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCw, Calculator, Split, Combine, Calendar } from "lucide-react"

interface TransformationTabProps {
  datasets: Dataset[]
}

export function TransformationTab({ datasets }: TransformationTabProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [activeOperation, setActiveOperation] = useState<string>("")

  if (datasets.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
        <p className="text-center text-sm text-zinc-400">Upload a CSV file to start transforming your data</p>
      </div>
    )
  }

  const operations = [
    { id: "pivot", label: "Pivot/Unpivot", icon: RotateCw },
    { id: "calculate", label: "Column Calculator", icon: Calculator },
    { id: "split", label: "Split Column", icon: Split },
    { id: "combine", label: "Combine Columns", icon: Combine },
    { id: "parse-date", label: "Parse Dates", icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      {/* Dataset Selector */}
      {datasets.length > 1 && (
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <Label className="text-sm text-zinc-400">Select Dataset</Label>
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Choose a dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset, idx) => (
                <SelectItem key={idx} value={dataset.name}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Operation Selector */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {operations.map((op) => {
          const Icon = op.icon
          return (
            <button
              key={op.id}
              onClick={() => setActiveOperation(op.id)}
              className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-all ${
                activeOperation === op.id
                  ? "border-zinc-600 bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <Icon className="h-8 w-8 text-zinc-400" />
              <span className="text-center text-sm font-medium text-zinc-200">{op.label}</span>
            </button>
          )
        })}
      </div>

      {/* Operation Forms */}
      {activeOperation === "pivot" && <PivotForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />}
      {activeOperation === "calculate" && (
        <CalculateForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
      {activeOperation === "split" && <SplitForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />}
      {activeOperation === "combine" && (
        <CombineForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
      {activeOperation === "parse-date" && (
        <ParseDateForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
    </div>
  )
}

function PivotForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [mode, setMode] = useState<"pivot" | "unpivot">("pivot")
  const [indexColumn, setIndexColumn] = useState("")
  const [columnsColumn, setColumnsColumn] = useState("")
  const [valuesColumn, setValuesColumn] = useState("")
  const [aggFunc, setAggFunc] = useState("sum")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Pivot:", { dataset, mode, indexColumn, columnsColumn, valuesColumn, aggFunc })
    // TODO: Call API function from lib/api/transformation.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Pivot/Unpivot Data</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as "pivot" | "unpivot")}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pivot">Pivot (Wide Format)</SelectItem>
              <SelectItem value="unpivot">Unpivot (Long Format)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "pivot" && (
          <>
            <div>
              <Label className="text-sm text-zinc-400">Index Column (rows)</Label>
              <Select value={indexColumn} onValueChange={setIndexColumn}>
                <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-zinc-400">Columns Column (spread to columns)</Label>
              <Select value={columnsColumn} onValueChange={setColumnsColumn}>
                <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-zinc-400">Values Column</Label>
              <Select value={valuesColumn} onValueChange={setValuesColumn}>
                <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-zinc-400">Aggregation Function</Label>
              <Select value={aggFunc} onValueChange={setAggFunc}>
                <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="mean">Mean</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="min">Min</SelectItem>
                  <SelectItem value="max">Max</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function CalculateForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [newColumnName, setNewColumnName] = useState("")
  const [expression, setExpression] = useState("")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Calculate:", { dataset, newColumnName, expression })
    // TODO: Call API function from lib/api/transformation.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Column Calculator</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">New Column Name</Label>
          <Input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="e.g., total_price"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Expression</Label>
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., price * quantity"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500">Available columns: {columns.join(", ")}</p>
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function SplitForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [column, setColumn] = useState("")
  const [delimiter, setDelimiter] = useState(",")
  const [newColumnNames, setNewColumnNames] = useState("")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Split:", { dataset, column, delimiter, newColumnNames })
    // TODO: Call API function from lib/api/transformation.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Split Column</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Column to Split</Label>
          <Select value={column} onValueChange={setColumn}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Delimiter</Label>
          <Input
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            placeholder="e.g., , or space"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <div>
          <Label className="text-sm text-zinc-400">New Column Names (comma-separated)</Label>
          <Input
            value={newColumnNames}
            onChange={(e) => setNewColumnNames(e.target.value)}
            placeholder="e.g., first_name, last_name"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function CombineForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [separator, setSeparator] = useState(" ")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Combine:", { dataset, selectedColumns, newColumnName, separator })
    // TODO: Call API function from lib/api/transformation.ts
  }

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Combine Columns</h3>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 text-sm text-zinc-400">Columns to Combine</Label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {columns.map((col) => (
              <div key={col} className="flex items-center gap-2">
                <Checkbox
                  id={`combine-${col}`}
                  checked={selectedColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                />
                <label htmlFor={`combine-${col}`} className="text-sm text-zinc-300">
                  {col}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">New Column Name</Label>
          <Input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="e.g., full_address"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Separator</Label>
          <Input
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            placeholder="e.g., space or comma"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function ParseDateForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [column, setColumn] = useState("")
  const [format, setFormat] = useState("")
  const [extract, setExtract] = useState<string[]>([])

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const extractOptions = [
    { id: "year", label: "Year" },
    { id: "month", label: "Month" },
    { id: "day", label: "Day" },
    { id: "weekday", label: "Weekday" },
  ]

  const handleApply = () => {
    console.log("[v0] Parse Date:", { dataset, column, format, extract })
    // TODO: Call API function from lib/api/transformation.ts
  }

  const toggleExtract = (item: string) => {
    setExtract((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Parse Dates</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Date Column</Label>
          <Select value={column} onValueChange={setColumn}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Date Format</Label>
          <Input
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="e.g., %Y-%m-%d or %m/%d/%Y"
            className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>

        <div>
          <Label className="mb-2 text-sm text-zinc-400">Extract Components</Label>
          <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {extractOptions.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Checkbox
                  id={`extract-${opt.id}`}
                  checked={extract.includes(opt.id)}
                  onCheckedChange={() => toggleExtract(opt.id)}
                />
                <label htmlFor={`extract-${opt.id}`} className="text-sm text-zinc-300">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}
