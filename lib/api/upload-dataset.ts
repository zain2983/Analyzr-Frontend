import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

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
        throw await parseApiError(res, "Upload failed")
    }

    return res.json()
}