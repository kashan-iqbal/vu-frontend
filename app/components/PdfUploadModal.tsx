"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCoursePdf } from "@/lib/api/quiz.api";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — matches the backend limit

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfUploadModal({
  open,
  onClose,
  code,
  courseTitle,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
  courseTitle: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  // Validate type + size on the client before doing anything.
  const pickFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    const isPdf =
      f.type === "application/pdf" && f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please select a PDF file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("PDF must be 25 MB or smaller.");
      return;
    }
    setFile(f);
  };

  const handleClose = () => {
    setFile(null);
    setNote("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!file) {
      setError("Please choose a PDF to upload.");
      return;
    }

    const form = new FormData();
    form.append("pdf", file);
    form.append("code", code);
    form.append("courseTitle", courseTitle);
    if (note.trim()) form.append("note", note.trim());

    // Fire-and-forget: close the modal immediately and let the upload run in the
    // background, with a toast tracking its progress so the user isn't blocked.
    handleClose();
    toast.promise(uploadCoursePdf(form), {
      loading: "Uploading your PDF…",
      success: (res) => res.message || "PDF uploaded. Thank you for contributing!",
      error: (e) => {
        const err = e as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        return (
          err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again."
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">
              Upload course PDF
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Help us build a quiz for {courseTitle} ({code}). Share the course
              handout or notes as a PDF.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dropzone / file picker */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
          }`}
        >
          {file ? (
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="h-5 w-5 shrink-0 text-teal-600" />
              <span className="truncate text-sm font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-slate-400">
                {formatSize(file.size)}
              </span>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Click to choose or drag a PDF here
              </p>
              <p className="text-xs text-slate-400">PDF only · up to 25 MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {/* Optional note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Optional note (e.g. which chapters this covers)"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-900 text-white hover:bg-blue-800"
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
