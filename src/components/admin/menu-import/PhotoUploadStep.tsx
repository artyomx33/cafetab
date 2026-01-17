'use client'

import { useCallback, useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'

interface PhotoUploadStepProps {
  onUpload: (file: File) => void
  error: string | null
  onClose: () => void
}

export function PhotoUploadStep({ onUpload, error, onClose }: PhotoUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Import Menu from Photo</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[var(--muted-foreground)]" />
        </button>
      </div>

      <p className="text-[var(--muted-foreground)]">
        Upload a photo of your physical menu and we&apos;ll extract the items using AI.
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!preview ? (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging
              ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/5'
              : 'border-[var(--charcoal-600)] hover:border-[var(--charcoal-500)]'
            }
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--charcoal-700)] flex items-center justify-center">
              <Upload className="w-8 h-8 text-[var(--gold-400)]" />
            </div>
            <div>
              <p className="text-white font-medium">Drop menu photo here</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                or click to select from device
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded bg-[var(--charcoal-700)] text-[var(--muted-foreground)]">
                JPG
              </span>
              <span className="text-xs px-2 py-1 rounded bg-[var(--charcoal-700)] text-[var(--muted-foreground)]">
                PNG
              </span>
              <span className="text-xs px-2 py-1 rounded bg-[var(--charcoal-700)] text-[var(--muted-foreground)]">
                HEIC
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Menu preview"
              className="w-full max-h-64 object-contain bg-black/20"
            />
            <button
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
              }}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white font-medium transition-colors"
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
              }}
            >
              Choose Different
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--gold-500)] hover:bg-[var(--gold-400)] text-black font-medium transition-colors"
              onClick={() => selectedFile && onUpload(selectedFile)}
            >
              Extract Menu Items
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-[var(--muted-foreground)] space-y-1">
        <p><strong>Tips for best results:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Ensure good lighting and clear text</li>
          <li>Capture the entire menu page</li>
          <li>Avoid glare and shadows</li>
          <li>Multiple pages? Upload one at a time</li>
        </ul>
      </div>
    </div>
  )
}
