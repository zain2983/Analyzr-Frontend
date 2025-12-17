"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import type { Dataset } from "@/app/page"

interface FileUploadModalProps {
  datasets: Dataset[]
  onDatasetsChange: (datasets: Dataset[]) => void
  onClose: () => void
  maxFiles?: number
}

export function FileUploadModal({ datasets, onDatasetsChange, onClose, maxFiles = 5 }: FileUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    // Check max files limit
    if (datasets.length >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
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

      // Close modal after successful upload
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      setError("Failed to upload CSV. Please check the file format.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-2xl border-zinc-800 bg-zinc-900 p-6">
        {/* Close Button */}
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="absolute right-4 top-4 h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-zinc-100">Upload CSV File</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Add a new CSV file to your workspace ({datasets.length}/{maxFiles} files)
          </p>
        </div>

        {/* Upload Component */}
        <FileUpload
          onFileSelect={handleFileUpload}
          disabled={isLoading}
          maxFiles={maxFiles}
          currentFileCount={datasets.length}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Processing CSV file...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
