"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackendStatusDisplay } from "@/components/ui/backend-status"
import { X } from "lucide-react"
import type { Dataset } from "@/app/page"
import type { BackendStatus } from "@/lib/hooks/useBackendStatus"
import { useBackendStatus } from "@/lib/hooks/useBackendStatus"
import { uploadDataset } from "@/lib/api/sql"

interface FileUploadModalProps {
  datasets: Dataset[]
  onDatasetsChange: (updater: (prev: Dataset[]) => Dataset[]) => void
  onClose: () => void
  maxFiles?: number
}

export function FileUploadModal({ datasets, onDatasetsChange, onClose, maxFiles = 5 }: FileUploadModalProps) {
  const [error, setError] = useState<string | null>(null)
  const { status, elapsedTime, startRequest, completeRequest, failRequest } = useBackendStatus({
    wakingThreshold: 3000,
    slowThreshold: 8000,
    timeoutDuration: 30000,
  })

  const isProcessing = status !== "idle"

  const handleFileUpload = async (files: File[]) => {
    const remainingSlots = maxFiles - datasets.length

    if (files.length > remainingSlots) {
      setError(`Can only upload ${remainingSlots} more file(s)`)
      return
    }

    setError(null)
    const cleanup = startRequest()

    try {
      // Upload all files in parallel
      const uploadPromises = files.map(file => uploadDataset(file))
      const responses = await Promise.all(uploadPromises)

      // Validate responses
      const newDatasets: Dataset[] = responses.map((resp, idx) => {
        if (!resp || !resp.dataset_id) {
          throw new Error(`Invalid response for file: ${files[idx].name}`)
        }

        return {
          id: resp.dataset_id,
          name: files[idx].name,
          rows: resp.rows ?? 0,
          columns: Array.isArray(resp.columns) ? resp.columns.length : (resp.columns ?? 0),
          columnNames: Array.isArray(resp.columns) ? resp.columns : [],
        }
      })

      completeRequest()
      onDatasetsChange(prev => [...prev, ...newDatasets])

      // Close modal after successful upload
      setTimeout(() => {
        onClose()
      }, 300)
    } catch (err: any) {
      cleanup()
      failRequest(err instanceof TypeError ? "network" : "error")
      setError(err?.message ?? "Failed to upload files. Check backend connection.")
      console.error(err)
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
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-zinc-100">Upload Files</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Add new files to your workspace ({datasets.length}/{maxFiles} files)
          </p>
        </div>

        {/* Upload Component */}
        <FileUpload
          onFileSelect={handleFileUpload}
          disabled={isProcessing}
          maxFiles={maxFiles}
          currentFileCount={datasets.length}
        />

        {/* Backend Status Display */}
        <BackendStatusDisplay status={status} elapsedTime={elapsedTime} />

        {/* Error State */}
        {error && status === "error" && (
          <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
