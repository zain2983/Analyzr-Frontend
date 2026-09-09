"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, FileText, Download, Loader2, AlertTriangle, Trash2, Pencil } from "lucide-react"
import type { Dataset } from "@/app/page"
import { cn } from "@/lib/utils"
import { downloadDataset } from "@/lib/api/download-dataset"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FileToolbarProps {
  datasets: Dataset[]
  onUploadClick: () => void
  onRemoveDataset: (id: string) => void
  onRenameDataset: (id: string, name: string) => void
  onClearAll: () => void
  maxFiles?: number
  /** The dataset id to highlight as "active" — only set on tabs that operate on one chosen dataset. */
  highlightedDatasetId?: string
}

export function FileToolbar({
  datasets,
  onUploadClick,
  onRemoveDataset,
  onRenameDataset,
  onClearAll,
  maxFiles = 5,
  highlightedDatasetId,
}: FileToolbarProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

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

  const startEditing = (dataset: Dataset) => {
    setEditingId(dataset.id)
    setEditingValue(dataset.name)
  }

  const commitEditing = () => {
    const trimmed = editingValue.trim()
    if (editingId && trimmed) {
      onRenameDataset(editingId, trimmed)
    }
    setEditingId(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
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
                  {datasets.map((dataset) => {
                    const isHighlighted = !dataset.stale && dataset.id === highlightedDatasetId
                    return (
                    <div
                      key={dataset.id}
                      className={cn(
                        "relative flex items-center justify-between rounded-md border px-3 py-1.5 w-[220px] transition-colors",
                        dataset.stale
                          ? "border-yellow-600/50 bg-yellow-500/5"
                          : isHighlighted
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-700 bg-zinc-800/50",
                      )}
                    >
                      {isHighlighted && (
                        <span
                          className="absolute -left-px -top-px -bottom-px w-0.5 rounded-l-md bg-blue-500"
                          aria-hidden="true"
                        />
                      )}
                      {/* File icon + name */}
                      <div className="flex items-center gap-2 overflow-hidden">
                        {dataset.stale ? (
                          <AlertTriangle
                            className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500"
                            aria-label="No longer on server"
                          />
                        ) : (
                          <FileText
                            className={cn("h-3.5 w-3.5 flex-shrink-0", isHighlighted ? "text-blue-400" : "text-zinc-400")}
                          />
                        )}
                        {editingId === dataset.id ? (
                          <Input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={commitEditing}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEditing()
                              if (e.key === "Escape") cancelEditing()
                            }}
                            className="h-6 px-1 py-0 text-sm"
                          />
                        ) : (
                          <span
                            className="text-sm text-zinc-200 truncate cursor-text"
                            title={
                              dataset.stale ? `${dataset.name} — no longer on server, re-upload to use` : dataset.name
                            }
                            onDoubleClick={() => startEditing(dataset)}
                          >
                            {dataset.name}
                          </span>
                        )}
                      </div>

                      {editingId !== dataset.id && (
                        <div className="ml-2 flex items-center gap-1.5 flex-shrink-0">
                          {/* Rename button */}
                          <button
                            onClick={() => startEditing(dataset)}
                            className="text-zinc-400 transition-colors hover:text-zinc-100"
                            aria-label={`Rename ${dataset.name}`}
                            title="Rename"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Download button */}
                          <button
                            onClick={() => handleDownload(dataset)}
                            disabled={downloadingId === dataset.id || dataset.stale}
                            className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-50 disabled:hover:text-zinc-400"
                            aria-label={`Download ${dataset.name} as CSV`}
                            title={dataset.stale ? "Unavailable — no longer on server" : "Download CSV"}
                          >
                            {downloadingId === dataset.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Remove button */}
                          <button
                            onClick={() => onRemoveDataset(dataset.id)}
                            className="text-zinc-400 transition-colors hover:text-zinc-100"
                            aria-label={`Remove ${dataset.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Clear All Button */}
            {datasets.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Clear all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove all datasets?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes all {datasets.length} uploaded dataset{datasets.length > 1 ? "s" : ""} from this
                      session and evicts them on the backend. This can't be undone — you'll need to re-upload to use
                      them again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearAll}>Remove all</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

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
    </div>
  )
}
