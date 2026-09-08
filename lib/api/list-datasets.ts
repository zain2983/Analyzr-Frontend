import { BACKEND_URL } from "@/lib/config"

export async function listDatasetIds(): Promise<string[]> {
    const url = `${BACKEND_URL}/api/datasets`

    const res = await fetch(url)

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to list datasets: ${res.status} ${text}`)
    }

    const json = await res.json()
    return Array.isArray(json?.dataset_ids) ? json.dataset_ids : []
}
