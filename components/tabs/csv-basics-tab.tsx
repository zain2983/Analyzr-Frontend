"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { DatasetSummary } from "@/components/dataset-summary"
import type { Dataset } from "@/app/page"
import { Loader2 } from "lucide-react"

interface CSVBasicsTabProps {
  dataset: Dataset | null
  onDatasetChange: (dataset: Dataset | null) => void
}

export function CSVBasicsTab({ dataset, onDatasetChange }: CSVBasicsTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call to FastAPI backend
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await fetch('/api/upload', { method: 'POST', body: formData })
      // const data = await response.json()

      // Mock data parsing
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

      onDatasetChange({
        name: file.name,
        rows: rows.length,
        columns: headers.length,
        columnNames: headers,
        data: rows,
      })
    } catch (err) {
      setError("Failed to upload CSV. Please check the file format.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">CSV Basics</h2>
        <p className="mt-1 text-sm text-zinc-400">Upload and explore your CSV datasets</p>
      </div>

      {/* File Upload Card */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <FileUpload onFileSelect={handleFileUpload} disabled={isLoading} />
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="border-zinc-800 bg-zinc-900 p-8">
          <div className="flex items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Processing CSV file...</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Dataset Summary */}
      {dataset && !isLoading && <DatasetSummary dataset={dataset} />}
    </div>
  )
}
