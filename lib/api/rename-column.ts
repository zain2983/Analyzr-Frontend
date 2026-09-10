import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

export interface RenameColumnResponse {
  dataset_id: string
  columns: string[]
  column_types: Record<string, string>
}

/** Renames a column on the server-held frame — a thin caller of POST /api/transform/rename. */
export async function renameColumn(datasetId: string, column: string, newName: string): Promise<RenameColumnResponse> {
  const res = await fetch(`${BACKEND_URL}/api/transform/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset_id: datasetId, column, new_name: newName }),
  })

  if (!res.ok) {
    throw await parseApiError(res, "Rename failed")
  }

  return res.json()
}
