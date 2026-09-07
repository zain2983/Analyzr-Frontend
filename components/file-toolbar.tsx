"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, FileText, Download, Loader2 } from "lucide-react"
import type { Dataset } from "@/app/page"
import { cn } from "@/lib/utils"
import { downloadDataset } from "@/lib/api/download-dataset"

interface FileToolbarProps {
  datasets: Dataset[]
  onUploadClick: () => void
  onRemoveDataset: (index: number) => void
  maxFiles?: number
}

export function FileToolbar({ datasets, onUploadClick, onRemoveDataset, maxFiles = 5 }: FileToolbarProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (dataset: Dataset) => {
    setDownloadingId(dataset.id)
    try {
      await downloadDataset(dataset.id, dataset.name)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Uploaded Files */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {datasets.length === 0 ? (
              <p className="text-sm text-zinc-500">No files uploaded</p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Files:</span>
                <div className="flex gap-2">
                  {datasets.map((dataset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 w-[200px]"
                    >
                      {/* File icon + name */}
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        <span
                          className="text-sm text-zinc-200 truncate"
                          title={dataset.name} // full name on hover
                        >
                          {dataset.name}
                        </span>
                      </div>

                      <div className="ml-2 flex items-center gap-2 flex-shrink-0">
                        {/* Download button */}
                        <button
                          onClick={() => handleDownload(dataset)}
                          disabled={downloadingId === dataset.id}
                          className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-50"
                          aria-label={`Download ${dataset.name} as CSV`}
                          title="Download CSV"
                        >
                          {downloadingId === dataset.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveDataset(index)}
                          className="text-zinc-400 transition-colors hover:text-zinc-100"
                          aria-label={`Remove ${dataset.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={onUploadClick}
            disabled={datasets.length >= maxFiles}
            size="sm"
            className={cn(
              "shrink-0",
              datasets.length >= maxFiles
                ? "cursor-not-allowed bg-zinc-800/50 text-zinc-600"
                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
            )}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Upload CSV
            <span className="ml-2 text-xs text-zinc-400">
              ({datasets.length}/{maxFiles})
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
