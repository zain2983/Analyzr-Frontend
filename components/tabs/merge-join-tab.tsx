"use client"

import { useState } from "react"
import type { Dataset } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Merge, ArrowDownToLine, Search } from "lucide-react"

interface MergeJoinTabProps {
  datasets: Dataset[]
}

export function MergeJoinTab({ datasets }: MergeJoinTabProps) {
  const [activeOperation, setActiveOperation] = useState<string>("")

  if (datasets.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
        <p className="text-center text-sm text-zinc-400">Upload CSV files to start merging and joining data</p>
      </div>
    )
  }

  const operations = [
    { id: "merge", label: "Merge/Join CSVs", icon: Merge },
    { id: "concat", label: "Append/Concat", icon: ArrowDownToLine },
    { id: "lookup", label: "Lookup/VLOOKUP", icon: Search },
  ]

  return (
    <div className="space-y-6">
      {/* Operation Selector */}
      <div className="grid gap-4 sm:grid-cols-3">
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
      {activeOperation === "merge" && <MergeForm datasets={datasets} />}
      {activeOperation === "concat" && <ConcatForm datasets={datasets} />}
      {activeOperation === "lookup" && <LookupForm datasets={datasets} />}
    </div>
  )
}

function MergeForm({ datasets }: { datasets: Dataset[] }) {
  const [leftDataset, setLeftDataset] = useState("")
  const [rightDataset, setRightDataset] = useState("")
  const [leftColumn, setLeftColumn] = useState("")
  const [rightColumn, setRightColumn] = useState("")
  const [joinType, setJoinType] = useState("inner")

  const leftColumns = datasets.find((d) => d.name === leftDataset)?.columnNames || []
  const rightColumns = datasets.find((d) => d.name === rightDataset)?.columnNames || []

  const handleMerge = () => {
    console.log("[v0] Merge:", { leftDataset, rightDataset, leftColumn, rightColumn, joinType })
    // TODO: Call API function from lib/api/merge-join.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Merge/Join CSVs</h3>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-sm text-zinc-400">Left Dataset</Label>
            <Select value={leftDataset} onValueChange={setLeftDataset}>
              <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.name} value={dataset.name}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400">Right Dataset</Label>
            <Select value={rightDataset} onValueChange={setRightDataset}>
              <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.name} value={dataset.name}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-sm text-zinc-400">Left Join Column</Label>
            <Select value={leftColumn} onValueChange={setLeftColumn} disabled={!leftDataset}>
              <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {leftColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400">Right Join Column</Label>
            <Select value={rightColumn} onValueChange={setRightColumn} disabled={!rightDataset}>
              <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {rightColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Join Type</Label>
          <Select value={joinType} onValueChange={setJoinType}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inner">Inner Join (only matching rows)</SelectItem>
              <SelectItem value="left">Left Join (all from left, matching from right)</SelectItem>
              <SelectItem value="right">Right Join (all from right, matching from left)</SelectItem>
              <SelectItem value="outer">Outer Join (all rows from both)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleMerge} className="w-full">
          Merge Datasets
        </Button>
      </div>
    </Card>
  )
}

function ConcatForm({ datasets }: { datasets: Dataset[] }) {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])
  const [axis, setAxis] = useState<"vertical" | "horizontal">("vertical")

  const handleConcat = () => {
    console.log("[v0] Concat:", { selectedDatasets, axis })
    // TODO: Call API function from lib/api/merge-join.ts
  }

  const toggleDataset = (name: string) => {
    setSelectedDatasets((prev) => (prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Append/Concat Datasets</h3>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 text-sm text-zinc-400">Select datasets to combine</Label>
          <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {datasets.map((dataset) => (
              <div key={dataset.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`concat-${dataset.name}`}
                  checked={selectedDatasets.includes(dataset.name)}
                  onChange={() => toggleDataset(dataset.name)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                />
                <label htmlFor={`concat-${dataset.name}`} className="text-sm text-zinc-300">
                  {dataset.name} ({dataset.rows} rows × {dataset.columns} cols)
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Direction</Label>
          <Select value={axis} onValueChange={(v) => setAxis(v as "vertical" | "horizontal")}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical (stack rows)</SelectItem>
              <SelectItem value="horizontal">Horizontal (add columns)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleConcat} className="w-full" disabled={selectedDatasets.length < 2}>
          Concatenate Datasets
        </Button>
      </div>
    </Card>
  )
}

function LookupForm({ datasets }: { datasets: Dataset[] }) {
  const [sourceDataset, setSourceDataset] = useState("")
  const [lookupDataset, setLookupDataset] = useState("")
  const [keyColumn, setKeyColumn] = useState("")
  const [valueColumns, setValueColumns] = useState<string[]>([])

  const sourceColumns = datasets.find((d) => d.name === sourceDataset)?.columnNames || []
  const lookupColumns = datasets.find((d) => d.name === lookupDataset)?.columnNames || []

  const handleLookup = () => {
    console.log("[v0] Lookup:", { sourceDataset, lookupDataset, keyColumn, valueColumns })
    // TODO: Call API function from lib/api/merge-join.ts
  }

  const toggleValueColumn = (col: string) => {
    setValueColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Lookup/VLOOKUP</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Source Dataset (to enrich)</Label>
          <Select value={sourceDataset} onValueChange={setSourceDataset}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.name} value={dataset.name}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Lookup Dataset (contains values)</Label>
          <Select value={lookupDataset} onValueChange={setLookupDataset}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.name} value={dataset.name}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Key Column (common to both)</Label>
          <Select value={keyColumn} onValueChange={setKeyColumn} disabled={!sourceDataset}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {sourceColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 text-sm text-zinc-400">Value Columns (from lookup dataset to add)</Label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {lookupColumns.map((col) => (
              <div key={col} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`lookup-${col}`}
                  checked={valueColumns.includes(col)}
                  onChange={() => toggleValueColumn(col)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                />
                <label htmlFor={`lookup-${col}`} className="text-sm text-zinc-300">
                  {col}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleLookup} className="w-full">
          Apply Lookup
        </Button>
      </div>
    </Card>
  )
}
