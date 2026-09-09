// API calls for data cleaning operations
// TODO: backend does not implement /api/clean/* yet

import { BACKEND_URL } from "@/lib/config"

export interface FillNullsRequest {
  dataset_id: string
  column: string
  method: "mean" | "median" | "mode" | "forward" | "backward" | "drop" | "custom"
  custom_value?: string | number
}

export interface RemoveDuplicatesRequest {
  dataset_id: string
  key_columns: string[]
  keep: "first" | "last"
}

export interface FixDataTypesRequest {
  dataset_id: string
  column: string
  target_type: "string" | "number" | "date" | "boolean"
}

export interface CleanStringsRequest {
  dataset_id: string
  column: string
  operations: ("trim" | "lowercase" | "uppercase" | "remove_special")[]
}

export async function fillNullValues(request: FillNullsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/clean/fill-nulls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function removeDuplicates(request: RemoveDuplicatesRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/clean/remove-duplicates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function fixDataTypes(request: FixDataTypesRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/clean/fix-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function cleanStrings(request: CleanStringsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${BACKEND_URL}/api/clean/clean-strings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}
