"use client"

import { DatasetSummary } from "@/components/dataset-summary"
import type { Dataset } from "@/app/page"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CSVBasicsTabProps {
  datasets: Dataset[]
  onRemoveDataset: (id: string) => void
}

export function CSVBasicsTab({ datasets, onRemoveDataset }: CSVBasicsTabProps) {
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

          {datasets.map((dataset) => (
            <div key={dataset.id} className="relative">
              {dataset.stale && (
                <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  No longer on server — re-upload to use
                </div>
              )}
              <Button
                onClick={() => onRemoveDataset(dataset.id)}
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