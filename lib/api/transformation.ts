// API calls for data transformation operations
// TODO: Update base URL to your FastAPI backend endpoint

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface PivotRequest {
  dataset_name: string
  index_column: string
  columns_column: string
  values_column: string
  agg_func: "sum" | "mean" | "count" | "min" | "max"
}

export interface UnpivotRequest {
  dataset_name: string
  id_vars: string[]
  value_vars: string[]
  var_name: string
  value_name: string
}

export interface ColumnCalculatorRequest {
  dataset_name: string
  new_column_name: string
  expression: string
  column_references: string[]
}

export interface SplitColumnRequest {
  dataset_name: string
  column: string
  delimiter: string
  new_column_names: string[]
}

export interface CombineColumnsRequest {
  dataset_name: string
  columns: string[]
  new_column_name: string
  separator: string
}

export interface ParseDateRequest {
  dataset_name: string
  column: string
  format: string
  extract: ("year" | "month" | "day" | "weekday")[]
}

export async function pivotData(request: PivotRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/pivot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function unpivotData(request: UnpivotRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/unpivot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function calculateColumn(request: ColumnCalculatorRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function splitColumn(request: SplitColumnRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function combineColumns(request: CombineColumnsRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/combine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function parseDate(request: ParseDateRequest) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/api/transform/parse-date`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  return response.json()
}
