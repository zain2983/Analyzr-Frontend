import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

export async function downloadDataset(datasetId: string, filename: string) {
    const url = `${BACKEND_URL}/api/dataset/${datasetId}/download`

    const res = await fetch(url)

    if (!res.ok) {
        throw await parseApiError(res, "Download failed")
    }

    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = objectUrl
    a.download = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
}
