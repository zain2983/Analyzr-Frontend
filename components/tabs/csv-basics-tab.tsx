"use client"

import { useState } from "react"
import { DatasetSummary } from "@/components/dataset-summary"
import type { Dataset } from "@/app/page"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CSVBasicsTabProps {
  datasets: Dataset[]
  onDatasetsChange: (datasets: Dataset[]) => void
}

export function CSVBasicsTab({ datasets, onDatasetsChange }: CSVBasicsTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(true)

  const handleFileUpload = async (file: File) => {
    // Check max files limit
    if (datasets.length >= 5) {
      setError("Maximum 5 files allowed")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call to FastAPI backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Parse CSV locally for demo
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim())
      const rows = lines.slice(1).map((line) =>
        line.split(",").reduce((obj: Record<string, string>, val, idx) => {
          obj[headers[idx]] = val.trim()
          return obj
        }, {}),
      )

      const newDataset: Dataset = {
        name: file.name,
        rows: rows.length,
        columns: headers.length,
        columnNames: headers,
        data: rows,
      }

      onDatasetsChange([...datasets, newDataset])

      if (datasets.length === 0) {
        setShowUpload(false)
      }
    } catch (err) {
      setError("Failed to upload CSV. Please check the file format.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDataset = (index: number) => {
    const newDatasets = datasets.filter((_, i) => i !== index)
    onDatasetsChange(newDatasets)

    // Show upload if no datasets remain
    if (newDatasets.length === 0) {
      setShowUpload(true)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">CSV Basics</h2>
        <p className="mt-1 text-sm text-zinc-400">View summary information for your uploaded datasets</p>
      </div>

      {/* Empty State */}
      {datasets.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-400">No files uploaded yet</p>
          <p className="mt-1 text-xs text-zinc-500">Click the &quot;Upload CSV&quot; button above to get started</p>
        </div>
      )}

      {/* Dataset Summaries */}
      {datasets.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {datasets.length} dataset{datasets.length > 1 ? "s" : ""} uploaded
          </p>

          {datasets.map((dataset, index) => (
            <div key={index} className="relative">
              <Button
                onClick={() => handleRemoveDataset(index)}
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 z-10 h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </Button>
              <DatasetSummary dataset={dataset} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
