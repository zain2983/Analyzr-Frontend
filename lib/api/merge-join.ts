// API calls for merge and join operations
// TODO: Update base URL to your FastAPI backend endpoint

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface MergeCSVsRequest {
  dataset_names: string[]
  left_on: string
  right_on: string
  how: "inner" | "left" | "right" | "outer"
}

export interface ConcatCSVsRequest {
  dataset_names: string[]
  axis: "vertical" | "horizontal"
  ignore_index: boolean
}

export interface LookupRequest {
  source_dataset: string
  lookup_dataset: string
  key_column: string
  value_columns: string[]
}

export async function mergeCSVs(request: MergeCSVsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/merge/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function concatCSVs(request: ConcatCSVsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/merge/concat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function lookupValues(request: LookupRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/merge/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}
