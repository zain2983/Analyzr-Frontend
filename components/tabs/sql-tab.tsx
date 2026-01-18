"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import type { Dataset } from "@/app/page"
import { runQuery } from "@/lib/api/sql"
import { Database } from "lucide-react"

interface SQLTabProps {
  datasets: Dataset[]
}

export function SQLTab({ datasets }: SQLTabProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id ?? "")
  const [query, setQuery] = useState("SELECT * FROM dataset LIMIT 10")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultRows, setResultRows] = useState<Record<string, any>[]>([])

  useEffect(() => {
    if (!datasets.find(d => d.id === selectedDatasetId)) {
      setSelectedDatasetId(datasets[0]?.id ?? "")
    }
  }, [datasets])

  const execute = async () => {
    if (!selectedDatasetId) {
      // show error
      return
    }
    setLoading(true)
    setError(null)
    try {
      console.log("runQuery payload:", { dataset_id: selectedDatasetId, query })
      const res = await runQuery(query, selectedDatasetId)

      // Handle the new response format from backend
      if (res && res.data && Array.isArray(res.data)) {
        setResultRows(res.data)
      } else if (Array.isArray(res)) {
        setResultRows(res)
      } else if (res && res.rows && Array.isArray(res.rows)) {
        setResultRows(res.rows)
      } else {
        setResultRows([])
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Query failed")
    } finally {
      setLoading(false)
    }
  }

  const headers = resultRows.length > 0 ? Object.keys(resultRows[0]) : []

  if (datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">S-scale SQL</h2>
          <p className="mt-1 text-sm text-zinc-400">Upload a dataset to run SQL queries on the backend.</p>
        </div>
        <Card className="border-zinc-800 bg-zinc-900 p-12">
          <div className="text-center">
            <p className="mt-4 text-sm text-zinc-500">No dataset loaded. Upload a CSV file in the CSV Basics tab.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-2xl font-semibold text-zinc-100">SQL</h2>
        <p className="mt-1 text-sm text-zinc-400">Run SQL against your uploaded dataset on the backend.</p>
      </div> */}

      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <label className="mb-3 block text-sm font-medium text-zinc-300">Select Dataset</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 mb-4">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`relative flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${selectedDatasetId === ds.id
                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                : "border-zinc-700 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
                }`}
            >
              <Database className="h-4 w-4 flex-shrink-0 text-zinc-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-zinc-100">{ds.name}</p>
                <p className="text-xs text-zinc-500">{ds.rows} rows</p>
              </div>
              {selectedDatasetId === ds.id && (
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-medium text-zinc-400">SQL</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          rows={6}
        />

        <div className="mt-3 flex items-center gap-3">
          <Button onClick={execute} disabled={loading} className="bg-zinc-800 hover:bg-zinc-700">
            {loading ? "Running..." : "Run Query"}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </Card>

      {resultRows.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900">
          <div className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">
              Results ({resultRows.length} rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-sm font-semibold text-zinc-300 bg-zinc-950"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-zinc-800 hover:bg-zinc-950/50 transition-colors"
                    >
                      {headers.map((header) => (
                        <td
                          key={`${rowIdx}-${header}`}
                          className="px-4 py-3 text-sm text-zinc-300"
                        >
                          {row[header] === null ? (
                            <span className="text-zinc-500 italic">null</span>
                          ) : (
                            String(row[header])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SQLTab
