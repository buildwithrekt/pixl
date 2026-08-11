"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { useWalletAuth } from "@/hooks/use-wallet-auth"

interface ZoneEditImageProps {
  zoneId: string
  zoneWallet: string
  zoneSize: { w: number; h: number } // in cells
  hasImage: boolean
}

export function ZoneEditImage({
  zoneId,
  zoneWallet,
  zoneSize,
  hasImage,
}: ZoneEditImageProps) {
  const router = useRouter()
  const { signedAddress, isDemoMode } = useWalletAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Only show if connected wallet owns the zone
  const isOwner = signedAddress && signedAddress.toLowerCase() === zoneWallet.toLowerCase()

  const pixelWidth = zoneSize.w * 8
  const pixelHeight = zoneSize.h * 8

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setFile(selectedFile)

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

  const handleUpload = useCallback(async () => {
    if (!file || !signedAddress) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("zoneId", zoneId)
      formData.append("wallet", signedAddress)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      // Close modal and refresh page
      setIsOpen(false)
      setPreview(null)
      setFile(null)
      router.refresh()
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }, [file, signedAddress, zoneId, router])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setPreview(null)
    setFile(null)
  }, [])

  if (!isOwner) {
    return null
  }

  return (
    <>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        {hasImage ? "Update artwork" : "Add artwork"}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>
          <h2 className="font-display text-lg font-bold">
            {hasImage ? "Update artwork" : "Add artwork"}
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Size info */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-400">Zone size:</span>
              <Chip>
                {pixelWidth}×{pixelHeight} px
              </Chip>
            </div>

            {/* Dropzone */}
            <Card
              variant="glow"
              className={`p-6 transition-colors ${
                dragActive ? "border-lime" : ""
              }`}
            >
              <div
                className="border border-dashed border-gray-600 rounded-[4px] p-8 text-center cursor-pointer hover:border-lime transition-colors"
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
                      className="mx-auto border border-gray-700 rounded-[4px] overflow-hidden"
                      style={{
                        width: Math.min(pixelWidth, 200),
                        height: Math.min(pixelHeight, 200),
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
                    <p className="text-sm text-gray-400">Click or drop to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto border border-gray-600 rounded-[4px] flex items-center justify-center">
                      <span className="text-2xl text-gray-400">+</span>
                    </div>
                    <p className="font-display font-bold text-white">Drop your image here</p>
                    <p className="text-sm text-gray-400">
                      or click to browse (PNG, JPG, GIF, WebP)
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Note */}
            <p className="text-sm text-gray-500 text-center">
              Image will be resized to fit your zone. Full RGB colors supported.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                {isUploading ? "Uploading..." : "Save"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  )
}
