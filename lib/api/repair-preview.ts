import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

export interface RepairPreviewRow {
  before: Record<string, string | null>
  after: Record<string, string | null>
}

/** Fetched on demand — the upload response deliberately doesn't carry this. */
export async function fetchRepairPreview(datasetId: string): Promise<RepairPreviewRow[]> {
  const res = await fetch(`${BACKEND_URL}/api/dataset/${encodeURIComponent(datasetId)}/repair-preview`)

  if (!res.ok) {
    throw await parseApiError(res, "Failed to load repair preview")
  }

  const body = await res.json()
  return Array.isArray(body?.rows) ? body.rows : []
}
