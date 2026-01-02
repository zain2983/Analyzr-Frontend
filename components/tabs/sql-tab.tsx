"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import type { Dataset } from "@/app/page"
import { runQuery } from "@/lib/api/sql"

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
      // Expect res.rows or an array of records
      if (Array.isArray(res)) {
        setResultRows(res)
      } else if (res && res.rows) {
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
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">S-scale SQL</h2>
        <p className="mt-1 text-sm text-zinc-400">Run SQL against your uploaded dataset on the backend.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900 p-4">
        <label className="mb-2 block text-sm font-medium text-zinc-400">Select Dataset</label>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.rows} rows)
            </option>
          ))}
        </select>

        <label className="mb-2 mt-4 block text-sm font-medium text-zinc-400">SQL</label>
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
          <DataTable headers={headers} rows={resultRows.map((r) => headers.map((h) => String(r[h] ?? "")))} />
        </Card>
      )}
    </div>
  )
}

export default SQLTab
