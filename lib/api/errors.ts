/**
 * Reads an error response body and returns an Error carrying just the backend's
 * `detail` message, when present, instead of the raw `status {"detail": "..."}` blob.
 */
export async function parseApiError(res: Response, fallbackMessage: string): Promise<Error> {
    const text = await res.text()

    try {
        const parsed = JSON.parse(text)
        if (parsed && typeof parsed.detail === "string") {
            return new Error(parsed.detail)
        }
    } catch {
        // response body wasn't JSON — fall through to the raw text
    }

    return new Error(text || fallbackMessage)
}
