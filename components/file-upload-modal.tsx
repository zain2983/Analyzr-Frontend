"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import type { Dataset } from "@/app/page"
import { uploadDataset } from "@/lib/api/sql"

interface FileUploadModalProps {
  datasets: Dataset[]
  onDatasetsChange: (updater: (prev: Dataset[]) => Dataset[]) => void  // optional: accept setter
  onClose: () => void
  maxFiles?: number
}

export function FileUploadModal({ datasets, onDatasetsChange, onClose, maxFiles = 5 }: FileUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (datasets.length >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload to backend immediately. Backend returns { dataset_id, rows, columns }
      const resp = await uploadDataset(file)

      if (!resp || !resp.dataset_id) {
        throw new Error("Invalid response from backend")
      }

      const newDataset: Dataset = {
        id: resp.dataset_id,
        name: file.name,
        rows: resp.rows ?? 0,
        columns: Array.isArray(resp.columns) ? resp.columns.length : (resp.columns ?? 0),
        columnNames: Array.isArray(resp.columns) ? resp.columns : [],
      }

      onDatasetsChange(prev => [...prev, newDataset])

      // Close modal after successful upload
      setTimeout(() => {
        onClose()
      }, 300)
    } catch (err: any) {
      setError(err?.message ?? "Failed to upload file. Check backend connection.")
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
