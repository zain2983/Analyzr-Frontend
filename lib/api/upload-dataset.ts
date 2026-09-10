import { BACKEND_URL } from "@/lib/config"
import { parseApiError } from "./errors"

export async function uploadDataset(file: File) {
    const url = `${BACKEND_URL}/api/upload`
    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch(url, {
        method: "POST",
        body: fd,
    })

    if (!res.ok) {
        throw await parseApiError(res, "Upload failed")
    }

    return res.json()
}