"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import HelpButton from "./ui/helpbutton";

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  maxFiles?: number
  currentFileCount?: number
}

export function FileUpload({ onFileSelect, disabled, maxFiles = 5, currentFileCount = 0 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAllowed = (fileName: string) => /\.(csv|json|xlsx)$/i.test(fileName)

  const handleFileChange = (file: File | null) => {
    if (file && isAllowed(file.name)) {
      onFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const canUploadMore = currentFileCount < maxFiles

  return (

    <div className="file-upload-section">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Upload files</h3>
        <HelpButton
          message="Upload CSV, XLSX or JSON files here. You can drag & drop or use the picker. Accepted formats: CSV, XLSX. Small files are processed in-browser; large files are uploaded to the server."
          link="https://example.com/help#file-upload"
        />
      </div>



      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-500/5" : "border-zinc-800 hover:border-zinc-700"
          } ${!canUploadMore ? "opacity-50" : ""}`}
      >
        <Upload className="mx-auto h-10 w-10 text-zinc-600" />
        <p className="mt-4 text-sm font-medium text-zinc-300">
          {canUploadMore ? "Drag and drop your file here" : `Maximum ${maxFiles} files reached`}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {canUploadMore ? `or click to browse (${currentFileCount}/${maxFiles} files). Accepted: CSV, JSON, XLSX` : "Remove a file to upload more"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.xlsx"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={disabled || !canUploadMore}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || !canUploadMore}
          className="mt-4 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          Browse Files
        </Button>
      </div>
    </div>
  )
}
