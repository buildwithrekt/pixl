"use client"

import { useState, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"

interface UploadStepProps {
  zoneSize: {
    w: number // pixels
    h: number // pixels
  }
  onUpload: (file: File) => void
  onSkip: () => void
  isUploading: boolean
}

export function UploadStep({
  zoneSize,
  onUpload,
  onSkip,
  isUploading,
}: UploadStepProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFile(selectedFile)
      }
    },
    [handleFile]
  )

  const handleSubmit = () => {
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Size info */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500">Your zone size:</span>
        <Chip>
          {zoneSize.w}×{zoneSize.h} px
        </Chip>
      </div>

      {/* Dropzone */}
      <div
        className={`p-6 rounded-[4px] border transition-colors ${
          dragActive ? "bg-lime/10 border-lime" : "bg-gray-800 border-gray-700"
        }`}
      >
        <div
          className="border-2 border-dashed border-gray-600 rounded-[4px] p-8 text-center cursor-pointer hover:border-lime/50 transition-colors"
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          {preview ? (
            <div className="space-y-4">
              <div
                className="mx-auto border border-lime/50 rounded overflow-hidden"
                style={{
                  width: Math.min(zoneSize.w, 200),
                  height: Math.min(zoneSize.h, 200),
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-mono text-[10px] text-gray-500 uppercase">
                {file?.name}
              </p>
              <p className="text-sm text-gray-500">Click or drop to replace</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto border border-gray-600 rounded-[4px] flex items-center justify-center">
                <span className="text-2xl text-lime">+</span>
              </div>
              <p className="font-display font-bold text-white">Drop your image here</p>
              <p className="text-sm text-gray-500">
                or click to browse (PNG, JPG, GIF, WebP)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-500 text-center">
        Image will be resized to fit your zone. Full RGB colors supported.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onSkip}
          disabled={isUploading}
        >
          Skip for now
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
