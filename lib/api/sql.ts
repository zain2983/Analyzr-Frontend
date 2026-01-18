import { BACKEND_URL } from "@/lib/config"
import { useBackendStatus, type BackendStatus } from "@/lib/hooks/useBackendStatus"

export async function uploadDataset(file: File, datasetId?: string) {
    const url = `${BACKEND_URL}/api/upload`
    const fd = new FormData()
    fd.append("file", file)
    // send optional frontend-provided id as dataset_id if present (backend will usually assign)
    if (datasetId) fd.append("dataset_id", datasetId)

    const res = await fetch(url, {
        method: "POST",
        body: fd,
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Upload failed: ${res.status} ${text}`)
    }

    const json = await res.json()
    // console.log(json)
    return json
}

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
        const text = await res.text()
        throw new Error(`Query failed: ${res.status} ${text}`)
    }

    const json = await res.json()
    console.log(json)
    return json
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