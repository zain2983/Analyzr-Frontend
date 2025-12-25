"use client"

import { useState, useRef } from "react"
import type { Dataset } from "@/app/page"

export function ConversionTab({ datasets }: { datasets: Dataset[] }) {
  const [direction, setDirection] = useState<"csv2json" | "json2csv">("csv2json")
  const [delimiter, setDelimiter] = useState(",")
  const [uploadedText, setUploadedText] = useState("")
  const [uploadedType, setUploadedType] = useState<"csv" | "json" | "">("")
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number | "none">("none")
  const [outputText, setOutputText] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      setUploadedText(text)
      if (file.name.toLowerCase().endsWith(".csv")) setUploadedType("csv")
      else if (file.name.toLowerCase().endsWith(".json")) setUploadedType("json")
      else {
        // try to detect
        const trimmed = text.trim()
        setUploadedType(trimmed.startsWith("[") || trimmed.startsWith("{") ? "json" : "csv")
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setSelectedDatasetIndex("none")
      readFile(f)
    }
  }

  const getInputTextAndType = () => {
    if (selectedDatasetIndex !== "none") {
      const ds = datasets[selectedDatasetIndex]
      if (!ds) return { text: "", type: "" }
      // if dataset has data array, JSON is natural
      if (ds.data) return { text: JSON.stringify(ds.data, null, 2), type: "json" }
      return { text: "", type: "" }
    }
    return { text: uploadedText, type: uploadedType }
  }

  const parseCSV = (text: string, delim: string) => {
    const rows = text.split(/\r\n|\n/)
    if (rows.length === 0) return []
    const header = rows[0].split(delim)
    const data = rows.slice(1).filter(r => r.trim() !== "").map((r) => {
      const cols = r.split(delim)
      const obj: Record<string, any> = {}
      for (let i = 0; i < header.length; i++) {
        obj[header[i] ?? `col${i}`] = cols[i] ?? ""
      }
      return obj
    })
    return data
  }

//   const jsonToCsv = (data: any[], delim: string) => {
  const jsonToCsv = (data: Record<string, any>[], delim: string) => {
    if (!Array.isArray(data)) return ""
    const keySet = data.reduce<Set<string>>((acc, row) => {
      Object.keys(row || {}).forEach(k => acc.add(k))
      return acc
    }, new Set<string>())
    const keys = Array.from(keySet)
    const escape = (v: any) => {
      if (v === null || v === undefined) return ""
      const s = String(v)
      if (s.includes(delim) || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const rows: string[] = data.map((r) =>
      keys.map((k: string) => escape(r[k])).join(delim)
    )
    const lines: string[] = [keys.join(delim), ...rows]
    return lines.join("\n")
  }

  const handleConvert = () => {
    const { text, type } = getInputTextAndType()
    if (!text) {
      setOutputText("No input provided.")
      return
    }

    if (direction === "csv2json") {
      // accept CSV input (either detected CSV or uploaded or dataset flagged)
      const data = parseCSV(text, delimiter)
      setOutputText(JSON.stringify(data, null, 2))
    } else {
      // json2csv
      try {
        const parsed = JSON.parse(text)
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        const csv = jsonToCsv(arr, delimiter)
        setOutputText(csv)
      } catch (err) {
        setOutputText("Invalid JSON input.")
      }
    }
  }

  const handleDownload = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = direction === "csv2json" ? "converted.json" : "converted.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const { text: currentText, type: currentType } = getInputTextAndType()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left column: input */}
      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-lg font-medium">Source</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-300">Choose existing dataset</label>
          <select
            className="rounded bg-zinc-800 px-3 py-2"
            value={selectedDatasetIndex}
            onChange={(e) => {
              const v = e.target.value
              setUploadedText("")
              setUploadedType("")
              setSelectedDatasetIndex(v === "none" ? "none" : Number(v))
            }}
          >
            <option value="none">— Upload / Paste —</option>
            {datasets.map((d, i) => (
              <option key={i} value={i}>
                {d.name} ({d.rows}×{d.columns})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-300">Upload file (.csv or .json)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={handleFileChange}
            className="text-sm"
          />
          <button
            className="mt-1 inline-block rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
            onClick={() => {
              fileInputRef.current?.click()
            }}
          >
            Select file
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-300">Direction</label>
          <select
            className="rounded bg-zinc-800 px-3 py-2"
            value={direction}
            onChange={(e) => setDirection(e.target.value as any)}
          >
            <option value="csv2json">CSV → JSON</option>
            <option value="json2csv">JSON → CSV</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-300">Delimiter (first column input)</label>
          <input
            className="w-20 rounded bg-zinc-800 px-3 py-2 text-sm"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value || ",")}
            maxLength={1}
            title="Single character delimiter"
          />
          <span className="text-xs text-zinc-500">Current input type: {currentType || "unknown"}</span>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
            onClick={handleConvert}
          >
            Convert
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-500"
            onClick={handleDownload}
            disabled={!outputText}
          >
            Download
          </button>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Input preview</label>
          <textarea
            readOnly
            value={currentText}
            rows={10}
            className="mt-1 w-full resize-none rounded bg-zinc-800 p-3 text-sm"
          />
        </div>
      </div>

      {/* Right column: output */}
      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-lg font-medium">Result</h2>

        <div>
          <label className="text-sm text-zinc-300">Output</label>
          <textarea
            readOnly
            value={outputText}
            rows={22}
            className="mt-1 w-full resize-none rounded bg-zinc-800 p-3 text-sm"
          />
        </div>
      </div>
    </div>
  )
}