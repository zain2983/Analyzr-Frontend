import { runQuery } from "./sql"

/** Doubles embedded double-quotes so the identifier is safe to splice into SQL. */
function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

/** Reuses the shipped /api/query endpoint rather than a dedicated sample endpoint — zero extra backend work. */
export async function fetchColumnSample(datasetId: string, column: string): Promise<string[]> {
  const col = quoteIdentifier(column)
  const query = `SELECT ${col} FROM dataset WHERE ${col} IS NOT NULL LIMIT 5`
  const res = await runQuery(query, datasetId)
  const rows: Record<string, any>[] = Array.isArray(res?.data) ? res.data : []
  return rows.map((row) => String(row[column] ?? row[Object.keys(row)[0]] ?? "")).filter((v) => v !== "")
}
