"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { TextArea, Button, Checkbox } from "../shared";

type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

type HashResult = {
  algorithm: HashAlgorithm;
  hash: string;
  input: string;
};

export default function HashGenerator() {
  const t = useTranslations("hashGenerator");
  const [textInput, setTextInput] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>(["sha256"]);
  const [results, setResults] = useState<HashResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms: { value: HashAlgorithm; label: string; description: string }[] = [
    { value: "md5", label: t("algorithms.md5"), description: t("algorithms.md5Desc") },
    { value: "sha1", label: t("algorithms.sha1"), description: t("algorithms.sha1Desc") },
    { value: "sha256", label: t("algorithms.sha256"), description: t("algorithms.sha256Desc") },
    { value: "sha512", label: t("algorithms.sha512"), description: t("algorithms.sha512Desc") }
  ];

  const generateHash = async (input: string, algorithm: HashAlgorithm): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase() as any, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleTextHash = useCallback(async () => {
    if (!textInput.trim()) return;

    setIsGenerating(true);
    const newResults: HashResult[] = [];

    for (const algorithm of selectedAlgorithms) {
      try {
        const hash = await generateHash(textInput, algorithm);
        newResults.push({
          algorithm,
          hash,
          input: textInput
        });
      } catch (error) {
        console.error(`Error generating ${algorithm} hash:`, error);
      }
    }

    setResults(prev => [...newResults, ...prev]);
    setIsGenerating(false);
  }, [textInput, selectedAlgorithms]);

  const handleFileHash = useCallback(async (file: File) => {
    setIsGenerating(true);
    const newResults: HashResult[] = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      for (const algorithm of selectedAlgorithms) {
        try {
          const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase() as any, arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          newResults.push({
            algorithm,
            hash,
            input: file.name
          });
        } catch (error) {
          console.error(`Error generating ${algorithm} hash:`, error);
        }
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }

    setResults(prev => [...newResults, ...prev]);
    setIsGenerating(false);
  }, [selectedAlgorithms]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileHash(file);
    }
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      alert(t("copySuccess"));
    } catch (err) {
      alert(t("copyFailed"));
    }
  };

  const copyAllHashes = async () => {
    const allHashes = results.map(r => `${r.algorithm.toUpperCase()}: ${r.hash}`).join('\n');
    try {
      await navigator.clipboard.writeText(allHashes);
      alert(t("copyAllSuccess"));
    } catch (err) {
      alert(t("copyAllFailed"));
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const toggleAlgorithm = (algorithm: HashAlgorithm) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm)
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t("hashAlgorithms")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {algorithms.map((algo) => (
            <label key={algo.value} className="flex items-start gap-2 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <input
                type="checkbox"
                checked={selectedAlgorithms.includes(algo.value)}
                onChange={() => toggleAlgorithm(algo.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">{algo.label}</div>
                <div className="text-xs text-neutral-500">{algo.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-3">
        <TextArea
          label={t("textInput")}
          value={textInput}
          onChange={setTextInput}
          placeholder={t("textPlaceholder")}
          rows={4}
        />
        <Button
          onClick={handleTextHash}
          disabled={!textInput.trim() || isGenerating || selectedAlgorithms.length === 0}
        >
          {isGenerating ? t("generating") : t("generateHash")}
        </Button>
      </div>

      {/* File Input */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t("fileInput")}</h2>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:file:text-neutral-300"
          />
          <div className="text-xs text-neutral-500">
            {t("selectFile")}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("results")}</h2>
            <div className="flex gap-2">
              <button
                onClick={copyAllHashes}
                className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                {t("copyAll")}
              </button>
              <button
                onClick={clearResults}
                className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                {t("clear")}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {result.algorithm.toUpperCase()} - {result.input}
                  </div>
                  <button
                    onClick={() => copyHash(result.hash)}
                    className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {t("copy")}
                  </button>
                </div>
                <div className="font-mono text-sm break-all bg-white dark:bg-neutral-800 p-2 rounded border">
                  {result.hash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">{t("securityNotice")}</h3>
        <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• {t("security1")}</li>
          <li>• {t("security2")}</li>
          <li>• {t("security3")}</li>
          <li>• {t("security4")}</li>
        </ul>
      </div>
    </div>
  );
}
