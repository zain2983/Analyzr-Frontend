"use client"

import { Button } from "@/components/ui/button"
import { Plus, X, FileText } from "lucide-react"
import type { Dataset } from "@/app/page"
import { cn } from "@/lib/utils"

interface FileToolbarProps {
  datasets: Dataset[]
  onUploadClick: () => void
  onRemoveDataset: (index: number) => void
  maxFiles?: number
}

export function FileToolbar({ datasets, onUploadClick, onRemoveDataset, maxFiles = 5 }: FileToolbarProps) {
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
                      className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-sm text-zinc-200">{dataset.name}</span>
                      <button
                        onClick={() => onRemoveDataset(index)}
                        className="ml-1 text-zinc-400 transition-colors hover:text-zinc-100"
                        aria-label={`Remove ${dataset.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
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
