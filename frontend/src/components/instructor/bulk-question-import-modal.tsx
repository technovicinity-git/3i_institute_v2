"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useBulkImportQuestionsMutation } from "@/hooks/use-questions";

interface BulkImportModalProps {
  courseId: string;
  onClose: () => void;
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export function BulkQuestionImportModal({
  courseId,
  onClose,
}: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useBulkImportQuestionsMutation();

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = () => {
    if (!file) return;

    importMutation.mutate(
      { courseId, file },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.failed === 0) {
            setFile(null);
          }
        },
      },
    );
  };

  const downloadTemplate = () => {
    window.open("/templates/questions-template.csv", "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl p-6 w-full max-w-[600px] max-h-[85vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#0C1F33]">
              Bulk Import Questions
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Upload a CSV file to import multiple questions at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0C1F33]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template download */}
        <div className="mb-5 p-4 bg-[#F9F6F0] border border-[#E3E8EF] rounded-lg flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#B8912F] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#0C1F33]">
                Need a template?
              </p>
              <p className="text-xs text-[#64748B]">
                Download the CSV template with examples
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#12304E] rounded-lg text-xs font-semibold text-[#12304E] hover:bg-gray-50 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>

        {/* File upload */}
        {!result && (
          <>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 py-10 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#22A146] bg-green-50"
                  : "border-[#E3E8EF] bg-[#FBF9F4] hover:border-gray-300"
              }`}
            >
              <Upload className="w-8 h-8 text-[#64748B]" />
              <div className="text-center">
                <p className="text-sm font-semibold text-[#0C1F33]">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  CSV only, max 5MB (up to ~1,000 questions)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>

            {file && (
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
                >
                  Clear
                </button>
                <button
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                  className="flex-1 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
                >
                  {importMutation.isPending
                    ? "Importing..."
                    : "Import Questions"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#FBF9F4] rounded-lg p-4 text-center">
                <p className="text-xl font-bold text-[#0C1F33]">
                  {result.total}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-xl font-bold text-[#22A146]">
                  {result.imported}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Imported</p>
              </div>
              <div
                className={`rounded-lg p-4 text-center ${
                  result.failed > 0 ? "bg-red-50" : "bg-[#FBF9F4]"
                }`}
              >
                <p
                  className={`text-xl font-bold ${
                    result.failed > 0 ? "text-red-600" : "text-[#0C1F33]"
                  }`}
                >
                  {result.failed}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Failed</p>
              </div>
            </div>

            {/* Success banner */}
            {result.imported > 0 && result.failed === 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#22A146] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    All questions imported successfully
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {result.imported} questions added to this course.
                  </p>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">
                    {result.errors.length} row(s) had errors
                  </p>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-[#E3E8EF]">
                  {result.errors.map((err, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                        Row {err.row}
                      </span>
                      <p className="text-sm text-[#0C1F33] flex-1">
                        {err.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
              >
                Import Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
