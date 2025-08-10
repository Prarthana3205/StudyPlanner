"use client";

import { useState, useRef } from "react";

interface StudyGenieProps {}

export default function StudyGenie({}: StudyGenieProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'text/plain'
    ];
    
    const allowedExtensions = ['.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  };

  const handleFile = async (file: File) => {
    setError("");
    setSummary("");
    setFileName("");

    if (!validateFile(file)) {
      setError("Please upload a TXT file only. More formats coming soon!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be less than 10MB.");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/study-genie', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setSummary("");
    setFileName("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-3">
          <img src="/genie.png" alt="StudyGenie" className="w-8 h-8" />
          StudyGenie
        </h1>
        <p className="text-purple-700 dark:text-purple-300 mb-8">
          Upload your TXT files and get an AI-powered summary to help you study smarter!
        </p>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-purple-300 dark:border-purple-600 bg-purple-25 dark:bg-purple-900/10"
            } ${uploading ? "opacity-50 pointer-events-none" : "hover:border-purple-400 cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl">
                {uploading ? "⏳" : "📄"}
              </div>
              <div>
                <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  {uploading ? "Processing your file..." : "Drop your file here or click to upload"}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  Supports TXT files (Max 10MB) • PDF and DOCX support coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">❌ {error}</p>
          </div>
        )}

        {/* File Processing Status */}
        {uploading && fileName && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              📤 Processing: {fileName}
            </p>
            <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        )}

        {/* Summary Result */}
        {summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-700">
            <div className="p-6 border-b border-purple-200 dark:border-purple-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                  📋 Summary for: {fileName}
                </h2>
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Upload New File
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-black-700 dark:text-black-300 leading-relaxed">
                  {summary}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!summary && !uploading && (
          <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
              💡 How StudyGenie Works:
            </h3>
            <ul className="space-y-2 text-purple-700 dark:text-purple-300">
              <li>• Upload your study materials (TXT files)</li>
              <li>• Our AI analyzes the content and extracts key information</li>
              <li>• Get a concise summary with main points and important concepts</li>
              <li>• Use the summary to review and study more efficiently</li>
              <li>• PDF and DOCX support coming soon with enhanced features!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}