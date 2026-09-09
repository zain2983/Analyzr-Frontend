import { BACKEND_URL } from "@/lib/config"
import { useBackendStatus, type BackendStatus } from "@/lib/hooks/useBackendStatus"
import { uploadDataset } from "./upload-dataset"
import { parseApiError } from "./errors"

export async function runQuery(query: string, datasetId?: string) {
    const url = `${BACKEND_URL}/api/query`

    // backend expects dataset_id and query
    const payload = { query, dataset_id: datasetId }

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        throw await parseApiError(res, "Query failed")
    }

    return res.json()
}

// Add a wrapper function for uploads with cold start handling
export async function uploadDatasetWithColdStartHandling(
    file: File,
    onStatusChange?: (status: BackendStatus) => void
) {
    const { startRequest, completeRequest, failRequest } = useBackendStatus({
        onStatusChange,
    })

    const cleanup = startRequest()

    try {
        const response = await uploadDataset(file)
        completeRequest()
        return response
    } catch (error) {
        cleanup()
        if (error instanceof TypeError && error.message.includes("fetch")) {
            failRequest("network")
        } else {
            failRequest("error")
        }
        throw error
    }
}

export default { uploadDataset, runQuery }