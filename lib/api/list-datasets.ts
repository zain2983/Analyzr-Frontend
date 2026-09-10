import { BACKEND_URL } from "@/lib/config"

/**
 * Asks the backend which of *our own* cached dataset ids still exist.
 *
 * This replaces a `GET /api/datasets` that returned every id the server held.
 * With no accounts, a dataset id is the capability to read and delete that
 * dataset, so listing them all let any visitor download every other visitor's
 * upload. Sending the ids we already hold answers the same question — which
 * of my files survived a backend restart? — without learning anyone else's.
 */
export async function reconcileDatasetIds(knownIds: string[]): Promise<string[]> {
    if (knownIds.length === 0) return []

    const res = await fetch(`${BACKEND_URL}/api/datasets/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_ids: knownIds }),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to reconcile datasets: ${res.status} ${text}`)
    }

    const json = await res.json()
    return Array.isArray(json?.dataset_ids)
        ? json.dataset_ids.filter((id: unknown): id is string => typeof id === "string")
        : []
}
