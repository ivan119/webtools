"use client";

import React, { useState, useRef, useCallback } from "react";
import { TextArea, Button, Select } from "../shared";

type FormatMode = "prettify" | "minify" | "validate";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<FormatMode>("prettify");
  const [indentSize, setIndentSize] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatJson = useCallback((jsonString: string, formatMode: FormatMode): string => {
    try {
      const parsed = JSON.parse(jsonString);
      
      switch (formatMode) {
        case "prettify":
          return JSON.stringify(parsed, null, indentSize);
        case "minify":
          return JSON.stringify(parsed);
        case "validate":
          return "✅ Valid JSON";
        default:
          return jsonString;
      }
    } catch (err) {
      throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [indentSize]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;

    try {
      setError("");
      const result = formatJson(input, mode);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setOutput("");
    }
  }, [input, mode, formatJson]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("JSON copied to clipboard!");
    } catch (err) {
      alert("Failed to copy JSON");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const loadSample = () => {
    const sampleJson = {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      },
      "hobbies": ["reading", "coding", "hiking"],
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z"
    };
    setInput(JSON.stringify(sampleJson));
  };

  const compressJson = () => {
    try {
      const parsed = JSON.parse(input);
      const compressed = JSON.stringify(parsed);
      setOutput(compressed);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const escapeJson = () => {
    try {
      const escaped = JSON.stringify(input);
      setOutput(escaped);
      setError("");
    } catch (err) {
      setError("Failed to escape JSON");
    }
  };

  const unescapeJson = () => {
    try {
      const unescaped = JSON.parse(input);
      setOutput(unescaped);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">JSON Formatter</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Format, validate, and manipulate JSON data. Pretty-print, minify, and fix JSON formatting issues.
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Upload JSON File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:file:text-neutral-300"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("prettify")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "prettify"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            Prettify
          </button>
          <button
            onClick={() => setMode("minify")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "minify"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            Minify
          </button>
          <button
            onClick={() => setMode("validate")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "validate"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            Validate
          </button>
        </div>

        {mode === "prettify" && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Indent:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
              <option value={1}>1 tab</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={loadSample}
            className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Load Sample
          </button>
          <button
            onClick={clearAll}
            className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Input JSON</h2>
            <div className="text-sm text-neutral-500">
              {input.length} characters
            </div>
          </div>
          <TextArea
            label=""
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here..."
            rows={15}
          />
          <Button
            onClick={handleFormat}
            disabled={!input.trim()}
            className="w-full"
          >
            {mode === "prettify" && "Prettify JSON"}
            {mode === "minify" && "Minify JSON"}
            {mode === "validate" && "Validate JSON"}
          </Button>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output</h2>
            {output && (
              <button
                onClick={copyOutput}
                className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                Copy
              </button>
            )}
          </div>
          
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-red-800 dark:text-red-200 font-mono text-sm">
                {error}
              </div>
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              rows={15}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 font-mono text-sm resize-none"
            />
          )}
        </div>
      </div>

      {/* Additional Tools */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Additional Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={compressJson}
            disabled={!input.trim()}
            className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 text-sm"
          >
            <div className="font-medium">Compress</div>
            <div className="text-xs text-neutral-500">Remove all whitespace</div>
          </button>
          
          <button
            onClick={escapeJson}
            disabled={!input.trim()}
            className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 text-sm"
          >
            <div className="font-medium">Escape</div>
            <div className="text-xs text-neutral-500">Escape special characters</div>
          </button>
          
          <button
            onClick={unescapeJson}
            disabled={!input.trim()}
            className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 text-sm"
          >
            <div className="font-medium">Unescape</div>
            <div className="text-xs text-neutral-500">Unescape special characters</div>
          </button>
          
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(input);
                const keys = Object.keys(parsed);
                setOutput(keys.join('\n'));
                setError("");
              } catch (err) {
                setError("Invalid JSON");
              }
            }}
            disabled={!input.trim()}
            className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 text-sm"
          >
            <div className="font-medium">Extract Keys</div>
            <div className="text-xs text-neutral-500">Get all object keys</div>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips</h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use prettify to format JSON with proper indentation</li>
          <li>• Use minify to reduce file size by removing whitespace</li>
          <li>• Validate to check if your JSON is properly formatted</li>
          <li>• All processing happens client-side - your data stays private</li>
        </ul>
      </div>
    </div>
  );
}
