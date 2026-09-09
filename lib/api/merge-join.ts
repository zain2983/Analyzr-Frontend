// API calls for merge and join operations
// TODO: backend does not implement /api/merge/* yet

import { BACKEND_URL } from "@/lib/config"

export interface MergeCSVsRequest {
  dataset_ids: string[]
  left_on: string
  right_on: string
  how: "inner" | "left" | "right" | "outer"
}

export interface ConcatCSVsRequest {
  dataset_ids: string[]
  axis: "vertical" | "horizontal"
  ignore_index: boolean
}

export interface LookupRequest {
  source_dataset_id: string
  lookup_dataset_id: string
  key_column: string
  value_columns: string[]
}

export async function mergeCSVs(request: MergeCSVsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/merge/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function concatCSVs(request: ConcatCSVsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/merge/concat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function lookupValues(request: LookupRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/merge/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}
