import { BACKEND_URL } from "@/lib/config"

export interface CheckCommasRequest {
    dataset_id: string
}

export async function checkCommas(request: CheckCommasRequest) {
    const response = await fetch(`${BACKEND_URL}/api/check-commas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Check commas failed: ${response.status} ${text}`)
    }

    return response.json()
}