"use client"

import { useState } from "react"
import type { Dataset } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Droplet, Copy, Type, ALargeSmall } from "lucide-react"

interface DataCleaningTabProps {
  datasets: Dataset[]
}

export function DataCleaningTab({ datasets }: DataCleaningTabProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [activeOperation, setActiveOperation] = useState<string>("")

  if (datasets.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
        <p className="text-center text-sm text-zinc-400">Upload a CSV file to start cleaning your data</p>
      </div>
    )
  }

  const operations = [
    { id: "fill-nulls", label: "Fill Missing Values", icon: Droplet },
    { id: "remove-duplicates", label: "Remove Duplicates", icon: Copy },
    { id: "fix-types", label: "Fix Data Types", icon: Type },
    { id: "clean-strings", label: "Clean Strings", icon: ALargeSmall },
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      {activeOperation === "fill-nulls" && (
        <FillNullsForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
      {activeOperation === "remove-duplicates" && (
        <RemoveDuplicatesForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
      {activeOperation === "fix-types" && (
        <FixDataTypesForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
      {activeOperation === "clean-strings" && (
        <CleanStringsForm dataset={selectedDataset || datasets[0].name} datasets={datasets} />
      )}
    </div>
  )
}

function FillNullsForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [column, setColumn] = useState("")
  const [method, setMethod] = useState("mean")
  const [customValue, setCustomValue] = useState("")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Fill nulls:", { dataset, column, method, customValue })
    // TODO: Call API function from lib/api/data-cleaning.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Fill Missing Values</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Column</Label>
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
          <Label className="text-sm text-zinc-400">Fill Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mean">Mean</SelectItem>
              <SelectItem value="median">Median</SelectItem>
              <SelectItem value="mode">Mode</SelectItem>
              <SelectItem value="forward">Forward Fill</SelectItem>
              <SelectItem value="backward">Backward Fill</SelectItem>
              <SelectItem value="custom">Custom Value</SelectItem>
              <SelectItem value="drop">Drop Rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method === "custom" && (
          <div>
            <Label className="text-sm text-zinc-400">Custom Value</Label>
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter value"
              className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
          </div>
        )}

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function RemoveDuplicatesForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [keep, setKeep] = useState<"first" | "last">("first")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Remove duplicates:", { dataset, selectedColumns, keep })
    // TODO: Call API function from lib/api/data-cleaning.ts
  }

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Remove Duplicates</h3>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 text-sm text-zinc-400">
            Select columns to check for duplicates (leave empty to check all columns)
          </Label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {columns.map((col) => (
              <div key={col} className="flex items-center gap-2">
                <Checkbox
                  id={`dup-${col}`}
                  checked={selectedColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                />
                <label htmlFor={`dup-${col}`} className="text-sm text-zinc-300">
                  {col}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm text-zinc-400">Keep</Label>
          <Select value={keep} onValueChange={(v) => setKeep(v as "first" | "last")}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first">First Occurrence</SelectItem>
              <SelectItem value="last">Last Occurrence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function FixDataTypesForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [column, setColumn] = useState("")
  const [targetType, setTargetType] = useState("string")

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const handleApply = () => {
    console.log("[v0] Fix data types:", { dataset, column, targetType })
    // TODO: Call API function from lib/api/data-cleaning.ts
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Fix Data Types</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Column</Label>
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
          <Label className="text-sm text-zinc-400">Target Type</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String (Text)</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  )
}

function CleanStringsForm({ dataset, datasets }: { dataset: string; datasets: Dataset[] }) {
  const [column, setColumn] = useState("")
  const [operations, setOperations] = useState<string[]>([])

  const currentDataset = datasets.find((d) => d.name === dataset)
  const columns = currentDataset?.columnNames || []

  const availableOps = [
    { id: "trim", label: "Trim Whitespace" },
    { id: "lowercase", label: "Convert to Lowercase" },
    { id: "uppercase", label: "Convert to Uppercase" },
    { id: "remove_special", label: "Remove Special Characters" },
  ]

  const handleApply = () => {
    console.log("[v0] Clean strings:", { dataset, column, operations })
    // TODO: Call API function from lib/api/data-cleaning.ts
  }

  const toggleOperation = (opId: string) => {
    setOperations((prev) => (prev.includes(opId) ? prev.filter((o) => o !== opId) : [...prev, opId]))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Clean Strings</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-zinc-400">Column</Label>
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
          <Label className="mb-2 text-sm text-zinc-400">Operations</Label>
          <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {availableOps.map((op) => (
              <div key={op.id} className="flex items-center gap-2">
                <Checkbox
                  id={`op-${op.id}`}
                  checked={operations.includes(op.id)}
                  onCheckedChange={() => toggleOperation(op.id)}
                />
                <label htmlFor={`op-${op.id}`} className="text-sm text-zinc-300">
                  {op.label}
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
