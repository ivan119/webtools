"use client";

import React, { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextArea, Button } from "../shared";

type TextStats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
};

function calculateStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const lines = text.split('\n').length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines
  };
}

export default function WordCounter() {
  const t = useTranslations("wordCounter");
  const [text, setText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => calculateStats(text), [text]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const clearText = () => {
    setText("");
    textareaRef.current?.focus();
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert(t("copySuccess"));
    } catch (err) {
      alert(t("copyFailed"));
    }
  };

  const copyStats = async () => {
    const statsText = `${t("words")}: ${stats.words}
${t("characters")}: ${stats.characters}
${t("characters")} (${t("noSpaces")}): ${stats.charactersNoSpaces}
${t("sentences")}: ${stats.sentences}
${t("paragraphs")}: ${stats.paragraphs}
${t("lines")}: ${stats.lines}`;
    
    try {
      await navigator.clipboard.writeText(statsText);
      alert(t("statsCopySuccess"));
    } catch (err) {
      alert(t("statsCopyFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t("uploadTextFile")}</label>
        <input
          type="file"
          accept=".txt,.md,.doc,.docx"
          onChange={handleFileUpload}
          className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:file:text-neutral-300"
        />
      </div>

      {/* Text Input */}
      <div className="space-y-3">
        <TextArea
          label={t("textInput")}
          value={text}
          onChange={setText}
          placeholder={t("textPlaceholder")}
          rows={8}
          showCharCount={true}
          maxLength={10000}
        />
        <div className="flex gap-2">
          <Button
            onClick={copyText}
            disabled={!text}
            variant="secondary"
            size="sm"
          >
            {t("copyText")}
          </Button>
          <Button
            onClick={clearText}
            variant="secondary"
            size="sm"
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("statistics")}</h2>
          <button
            onClick={copyStats}
            className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            {t("copyStats")}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.words}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("words")}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.characters}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("characters")}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.charactersNoSpaces}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("noSpaces")}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.sentences}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("sentences")}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.paragraphs}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("paragraphs")}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.lines}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t("lines")}</div>
          </div>
        </div>

        {/* Advanced Stats */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showAdvanced ? t("hideAdvanced") : t("showAdvanced")} {t("advancedStatistics")}
          </button>
          
          {showAdvanced && (
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("avgWordsPerSentence")}</span>
                  <span className="ml-2">{stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : "0"}</span>
                </div>
                <div>
                  <span className="font-medium">{t("avgCharsPerWord")}</span>
                  <span className="ml-2">{stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : "0"}</span>
                </div>
                <div>
                  <span className="font-medium">{t("avgWordsPerParagraph")}</span>
                  <span className="ml-2">{stats.paragraphs > 0 ? (stats.words / stats.paragraphs).toFixed(1) : "0"}</span>
                </div>
                <div>
                  <span className="font-medium">{t("readingTime")}</span>
                  <span className="ml-2">{Math.ceil(stats.words / 200)} {t("minutes")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
