"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CodeMirror from "@uiw/react-codemirror"
import { sql, type SQLNamespace } from "@codemirror/lang-sql"
import { oneDark } from "@codemirror/theme-one-dark"
import type { EditorView } from "@codemirror/view"
import type { Dataset } from "@/app/page"
import { runQuery } from "@/lib/api/sql"
import { DatasetSelector } from "@/components/dataset-selector"

interface SQLTabProps {
  datasets: Dataset[]
}

const DEFAULT_QUERY = "SELECT *\nFROM dataset\nLIMIT 10"

interface StarterQuery {
  label: string
  query: string
}

function buildStarterQueries(ds: Dataset | undefined): StarterQuery[] {
  if (!ds || ds.columnNames.length === 0) return []
  const cols = ds.columnNames
  const firstCol = cols[0]

  const nullAuditCols = cols
    .map((c) => `  SUM(CASE WHEN "${c}" IS NULL THEN 1 ELSE 0 END) AS "${c}_nulls"`)
    .join(",\n")

  return [
    { label: "Preview rows", query: `SELECT *\nFROM dataset\nLIMIT 10` },
    {
      label: "Group & count",
      query: `SELECT "${firstCol}", COUNT(*)\nFROM dataset\nGROUP BY "${firstCol}"\nORDER BY 2 DESC`,
    },
    { label: "Null audit", query: `SELECT\n${nullAuditCols}\nFROM dataset` },
  ]
}

function completionTypeForDtype(dtype: string | undefined): string {
  if (!dtype) return "property"
  if (/^(int|float|uint)/i.test(dtype)) return "property"
  if (/^bool/i.test(dtype)) return "property"
  if (/^datetime/i.test(dtype)) return "property"
  return "property"
}

function buildSchema(ds: Dataset | undefined): SQLNamespace | undefined {
  if (!ds) return undefined
  const columns = ds.columnNames.map((name) => ({
    label: name,
    type: completionTypeForDtype(ds.columnTypes?.[name]),
    detail: ds.columnTypes?.[name],
  }))
  // The backend registers the dataframe under both "dataset" and "data" —
  // completions need to cover whichever table name the user types.
  return { dataset: columns, data: columns }
}

export function SQLTab({ datasets }: SQLTabProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultRows, setResultRows] = useState<Record<string, any>[]>([])
  const [totalRows, setTotalRows] = useState(0)

  // Store query in a ref — never in state — so onChange never triggers re-renders
  const queryRef = useRef(DEFAULT_QUERY)
  const editorViewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!datasets.find((d) => d.id === selectedDatasetId)) {
      setSelectedDatasetId(datasets[0]?.id ?? "")
    }
  }, [datasets])

  const selectedDs = datasets.find((d) => d.id === selectedDatasetId)

  const sqlExtension = useMemo(
    () =>
      sql({
        schema: buildSchema(selectedDs),
        defaultTable: "dataset",
      }),
    [selectedDatasetId, selectedDs?.columnNames, selectedDs?.columnTypes]
  )

  const starterQueries = useMemo(() => buildStarterQueries(selectedDs), [selectedDs])

  const insertStarterQuery = useCallback((q: string) => {
    queryRef.current = q
    const view = editorViewRef.current
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: q },
      })
    }
  }, [])

  const execute = useCallback(async () => {
    if (!selectedDatasetId) return
    const trimmed = queryRef.current.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    try {
      const res = await runQuery(trimmed, selectedDatasetId)
      const data = Array.isArray(res?.data) ? res.data : []
      setResultRows(data)
      setTotalRows(typeof res?.rows === "number" ? res.rows : data.length)
    } catch (err: any) {
      setError(err?.message || "Query failed")
      setResultRows([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }, [selectedDatasetId])

  const headers = resultRows.length > 0 ? Object.keys(resultRows[0]) : []

  if (datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">SQL</h2>
          <p className="mt-1 text-sm text-zinc-400">Upload a dataset to run SQL queries on.</p>
        </div>
        <Card className="border-zinc-800 bg-zinc-900 p-12">
          <div className="text-center">
            <p className="mt-4 text-sm text-zinc-500">No dataset loaded. Upload a CSV file in the CSV Basics tab.</p>
          </div>
        </Card>
      </div>
    )
  }

  const queryCard = (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <DatasetSelector
        datasets={datasets}
        value={selectedDatasetId}
        onChange={setSelectedDatasetId}
        className="mb-4"
      />

      {starterQueries.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {starterQueries.map((sq) => (
            <Button
              key={sq.label}
              variant="outline"
              size="sm"
              onClick={() => insertStarterQuery(sq.query)}
              className="border-zinc-700 bg-zinc-950 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              {sq.label}
            </Button>
          ))}
        </div>
      )}

      <div className="rounded-md border border-zinc-800 overflow-hidden text-sm">
        <CodeMirror
          value={queryRef.current}
          height="150px"
          theme={oneDark}
          extensions={[sqlExtension]}
          onCreateEditor={(view) => {
            editorViewRef.current = view
          }}
          onChange={(val) => {
            queryRef.current = val
          }}
          indentWithTab={false}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            autocompletion: true,
          }}
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={execute} disabled={loading} className="bg-zinc-800 hover:bg-zinc-700">
          {loading ? "Running..." : "Run Query"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Card>
  )

  const resultsCard = (
    <Card className="border-zinc-800 bg-zinc-900">
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">
          {totalRows > resultRows.length
            ? `Showing first ${resultRows.length} of ${totalRows} rows`
            : `Results (${totalRows} row${totalRows === 1 ? "" : "s"})`}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-zinc-300 bg-zinc-950">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-zinc-800 hover:bg-zinc-950/50 transition-colors">
                  {headers.map((header) => (
                    <td key={`${rowIdx}-${header}`} className="px-4 py-3 text-sm text-zinc-300">
                      {row[header] === null ? <span className="text-zinc-500 italic">null</span> : String(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {queryCard}
      {resultRows.length > 0 && resultsCard}
    </div>
  )
}

export default SQLTab
