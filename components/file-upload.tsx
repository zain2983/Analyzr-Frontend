"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload, File } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file)
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

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-500/5" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-zinc-600" />
        <p className="mt-4 text-sm font-medium text-zinc-300">Drag and drop your CSV file here</p>
        <p className="mt-1 text-xs text-zinc-500">or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={disabled}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="mt-4 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          Browse Files
        </Button>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-300">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button onClick={handleUpload} disabled={disabled} className="bg-blue-600 text-white hover:bg-blue-700">
            Upload
          </Button>
        </div>
      )}
    </div>
  )
}
