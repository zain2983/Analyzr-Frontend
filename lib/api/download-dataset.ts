import { BACKEND_URL } from "@/lib/config"
import { safeDownloadFilename } from "@/lib/csv-safe"
import { parseApiError } from "./errors"

export async function downloadDataset(datasetId: string, filename: string) {
    // The id is interpolated into a URL path, so it gets encoded rather than
    // trusted — it round-trips through sessionStorage, which is outside this
    // code's control.
    const url = `${BACKEND_URL}/api/dataset/${encodeURIComponent(datasetId)}/download`

    const res = await fetch(url)

    if (!res.ok) {
        throw await parseApiError(res, "Download failed")
    }

    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = objectUrl
    // The dataset name is user-editable (double-click to rename), so it can
    // carry path separators or control characters by the time it lands here.
    a.download = safeDownloadFilename(filename)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
}
