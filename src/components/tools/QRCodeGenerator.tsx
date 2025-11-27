"use client";

import React, { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { TextArea, Button, NumberInput, Select } from "../shared";

export default function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [includeMargin, setIncludeMargin] = useState(true);

  const downloadQRCode = useCallback(() => {
    const svg = document.getElementById("qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `qrcode-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [size]);

  const copyAsSVG = useCallback(() => {
    const svg = document.getElementById("qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    navigator.clipboard.writeText(svgData).then(() => {
      alert("QR code SVG copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy SVG");
    });
  }, []);

  const levelOptions = [
    { value: "L", label: "Low (~7% error correction)" },
    { value: "M", label: "Medium (~15% error correction)" },
    { value: "Q", label: "Quartile (~25% error correction)" },
    { value: "H", label: "High (~30% error correction)" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">QR Code Generator</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Generate QR codes from text, URLs, or any data. Customize size, colors, and error correction level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            label="Text or URL"
            value={text}
            onChange={setText}
            placeholder="Enter text, URL, or any data to encode..."
            rows={6}
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Size (px)"
              value={size}
              onChange={setSize}
              min={100}
              max={1000}
              step={10}
            />
            <Select
              label="Error Correction"
              value={level}
              onChange={(value) => setLevel(value as "L" | "M" | "Q" | "H")}
              options={levelOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Foreground Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeMargin"
              checked={includeMargin}
              onChange={(e) => setIncludeMargin(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
            />
            <label htmlFor="includeMargin" className="text-sm">
              Include margin (quiet zone)
            </label>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex gap-2">
              <Button
                onClick={downloadQRCode}
                disabled={!text.trim()}
                size="sm"
                variant="secondary"
              >
                Download PNG
              </Button>
              <Button
                onClick={copyAsSVG}
                disabled={!text.trim()}
                size="sm"
                variant="secondary"
              >
                Copy SVG
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 min-h-[300px]">
            {text.trim() ? (
              <div className="flex flex-col items-center gap-4">
                <QRCodeSVG
                  id="qrcode-svg"
                  value={text}
                  size={size}
                  level={level}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  includeMargin={includeMargin}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center max-w-xs break-words">
                  {text}
                </p>
              </div>
            ) : (
              <div className="text-center text-neutral-400 dark:text-neutral-600">
                <p className="text-sm">Enter text above to generate QR code</p>
              </div>
            )}
          </div>

          {/* Quick Examples */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Quick Examples</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setText("https://example.com")}
                size="sm"
                variant="secondary"
              >
                URL
              </Button>
              <Button
                onClick={() => setText("Hello, World!")}
                size="sm"
                variant="secondary"
              >
                Text
              </Button>
              <Button
                onClick={() => setText("mailto:example@email.com")}
                size="sm"
                variant="secondary"
              >
                Email
              </Button>
              <Button
                onClick={() => setText("tel:+1234567890")}
                size="sm"
                variant="secondary"
              >
                Phone
              </Button>
              <Button
                onClick={() => setText("WIFI:T:WPA;S:NetworkName;P:Password;;")}
                size="sm"
                variant="secondary"
              >
                WiFi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About QR Codes
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• QR codes can store up to 4,296 alphanumeric characters</li>
          <li>• Higher error correction levels allow codes to work even when partially damaged</li>
          <li>• Use "High" error correction for codes that may be printed or displayed in low quality</li>
          <li>• QR codes are free to use and don't require any special permissions</li>
        </ul>
      </div>
    </div>
  );
}

