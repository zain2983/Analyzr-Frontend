import { BACKEND_URL } from "@/lib/config"

/**
 * Best-effort backend eviction. A 404 means the dataset is already gone on
 * the backend (e.g. a prior restart) — that's the desired end state, so it
 * resolves normally rather than throwing.
 */
export async function deleteDataset(datasetId: string): Promise<void> {
    const url = `${BACKEND_URL}/api/dataset/${encodeURIComponent(datasetId)}`

    const res = await fetch(url, { method: "DELETE" })

    if (!res.ok && res.status !== 404) {
        const text = await res.text()
        throw new Error(`Delete failed: ${res.status} ${text}`)
    }
}
