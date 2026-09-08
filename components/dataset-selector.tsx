"use client"

import type { Dataset } from "@/app/page"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Database } from "lucide-react"

interface DatasetSelectorProps {
  datasets: Dataset[]
  /** The selected dataset's `id`. Never a name or an array index. */
  value: string
  onChange: (id: string) => void
  variant: "grid" | "dropdown"
  label?: string
  placeholder?: string
  /** Dropdown only: prepend a sentinel option (e.g. "Upload / Paste") ahead of the dataset list. */
  allowNone?: boolean
  noneLabel?: string
  noneValue?: string
  className?: string
}

/**
 * Single dataset-picker used across tabs, always keyed by `Dataset.id`.
 * `id` is unique and stable across removals — unlike `name` (not deduped on
 * upload) or array index (shifts when a dataset is removed).
 */
export function DatasetSelector({
  datasets,
  value,
  onChange,
  variant,
  label = "Select Dataset",
  placeholder = "Choose a dataset",
  allowNone = false,
  noneLabel = "— Upload / Paste —",
  noneValue = "none",
  className,
}: DatasetSelectorProps) {
  if (variant === "dropdown") {
    return (
      <div className={className}>
        {label && <Label className="text-sm text-zinc-400">{label}</Label>}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={`w-full border-zinc-700 bg-zinc-800 text-zinc-100 ${label ? "mt-2" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allowNone && <SelectItem value={noneValue}>{noneLabel}</SelectItem>}
            {datasets.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id} disabled={dataset.stale}>
                {dataset.name} ({dataset.rows.toLocaleString()}×{dataset.columns})
                {dataset.stale ? " — unavailable" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && <label className="mb-3 block text-sm font-medium text-zinc-300">{label}</label>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {datasets.map((ds) => (
          <button
            key={ds.id}
            type="button"
            disabled={ds.stale}
            onClick={() => onChange(ds.id)}
            className={`relative flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
              ds.stale
                ? "cursor-not-allowed border-yellow-600/40 bg-yellow-500/5 opacity-60"
                : value === ds.id
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                  : "border-zinc-700 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
            }`}
          >
            {ds.stale ? (
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            ) : (
              <Database className="h-4 w-4 flex-shrink-0 text-zinc-400" />
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-zinc-100">{ds.name}</p>
              <p className="text-xs text-zinc-500">
                {ds.stale ? "Unavailable — re-upload to use" : `${ds.rows.toLocaleString()} rows · ${ds.columns} cols`}
              </p>
            </div>
            {!ds.stale && value === ds.id && (
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
