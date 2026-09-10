import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

/**
 * Downloads the *full* result set for a query — distinct from /api/query,
 * whose JSON payload is capped at 100 rows for the results table. Backed by
 * POST /api/query/export, which re-runs the query with a much larger
 * (200k-row) cap and streams CSV back.
 */
export async function exportQueryResults(datasetId: string, query: string): Promise<{ truncated: boolean }> {
    const res = await fetch(`${BACKEND_URL}/api/query/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_id: datasetId, query }),
    })

    if (!res.ok) {
        throw await parseApiError(res, "Export failed")
    }

    const truncated = res.headers.get("X-Result-Truncated") === "true"
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = objectUrl
    a.download = "query_results.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)

    return { truncated }
}
