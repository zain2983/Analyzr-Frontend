"use client"

import type { Dataset } from "@/app/page"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatasetSelectorProps {
  datasets: Dataset[]
  /** The selected dataset's `id`. Never a name or an array index. */
  value: string
  onChange: (id: string) => void
  label?: string
  placeholder?: string
  /** Prepend a sentinel option (e.g. "Upload / Paste") ahead of the dataset list. */
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
  label = "Select Dataset",
  placeholder = "Choose a dataset",
  allowNone = false,
  noneLabel = "— Upload / Paste —",
  noneValue = "none",
  className,
}: DatasetSelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="text-sm text-zinc-400">{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full ${label ? "mt-2" : ""}`}>
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
