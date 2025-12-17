"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  maxFiles?: number
  currentFileCount?: number
}

export function FileUpload({ onFileSelect, disabled, maxFiles = 5, currentFileCount = 0 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (file && file.name.endsWith(".csv")) {
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
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-blue-500 bg-blue-500/5" : "border-zinc-800 hover:border-zinc-700"
      } ${!canUploadMore ? "opacity-50" : ""}`}
    >
      <Upload className="mx-auto h-10 w-10 text-zinc-600" />
      <p className="mt-4 text-sm font-medium text-zinc-300">
        {canUploadMore ? "Drag and drop your CSV file here" : `Maximum ${maxFiles} files reached`}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {canUploadMore ? `or click to browse (${currentFileCount}/${maxFiles} files)` : "Remove a file to upload more"}
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
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
  )
}
