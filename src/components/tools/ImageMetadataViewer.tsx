"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import exifr from "exifr";
import { FileUpload, Button } from "../shared";

type MetadataSection = {
  title: string;
  data: Record<string, any>;
};

export default function ImageMetadataViewer() {
  const t = useTranslations("imageMetadataViewer");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date | string): string => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleString();
    } catch {
      return String(date);
    }
  };

  const organizeMetadata = (exifData: any, file: File): MetadataSection[] => {
    const sections: MetadataSection[] = [];

    // Basic File Information
    sections.push({
      title: t("sections.basicInfo"),
      data: {
        [t("fields.fileName")]: file.name,
        [t("fields.fileSize")]: formatBytes(file.size),
        [t("fields.fileType")]: file.type || "-",
        [t("fields.lastModified")]: formatDate(new Date(file.lastModified)),
      },
    });

    // Image Dimensions (from EXIF or image)
    if (exifData.ImageWidth || exifData.ExifImageWidth) {
      sections.push({
        title: t("sections.dimensions"),
        data: {
          [t("fields.width")]: exifData.ImageWidth || exifData.ExifImageWidth || "-",
          [t("fields.height")]: exifData.ImageHeight || exifData.ExifImageHeight || "-",
          [t("fields.orientation")]: exifData.Orientation || "-",
        },
      });
    }

    // Camera Information
    const cameraData: Record<string, any> = {};
    if (exifData.Make) cameraData[t("fields.make")] = exifData.Make;
    if (exifData.Model) cameraData[t("fields.model")] = exifData.Model;
    if (exifData.LensMake) cameraData[t("fields.lensMake")] = exifData.LensMake;
    if (exifData.LensModel) cameraData[t("fields.lensModel")] = exifData.LensModel;
    if (Object.keys(cameraData).length > 0) {
      sections.push({
        title: t("sections.camera"),
        data: cameraData,
      });
    }

    // Camera Settings
    const settingsData: Record<string, any> = {};
    if (exifData.ISO) settingsData[t("fields.iso")] = exifData.ISO;
    if (exifData.ExposureTime) settingsData[t("fields.exposureTime")] = `${exifData.ExposureTime}s`;
    if (exifData.FNumber || exifData.ApertureValue) {
      settingsData[t("fields.aperture")] = exifData.FNumber || `f/${exifData.ApertureValue}`;
    }
    if (exifData.FocalLength) settingsData[t("fields.focalLength")] = `${exifData.FocalLength}mm`;
    if (exifData.Flash) settingsData[t("fields.flash")] = exifData.Flash;
    if (exifData.WhiteBalance) settingsData[t("fields.whiteBalance")] = exifData.WhiteBalance;
    if (exifData.ExposureMode) settingsData[t("fields.exposureMode")] = exifData.ExposureMode;
    if (exifData.MeteringMode) settingsData[t("fields.meteringMode")] = exifData.MeteringMode;
    if (Object.keys(settingsData).length > 0) {
      sections.push({
        title: t("sections.cameraSettings"),
        data: settingsData,
      });
    }

    // Location Information (GPS)
    const locationData: Record<string, any> = {};
    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      locationData[t("fields.latitude")] = `${exifData.GPSLatitude}°`;
      locationData[t("fields.longitude")] = `${exifData.GPSLongitude}°`;
      // Add Google Maps link if coordinates are available
      const mapsUrl = `https://www.google.com/maps?q=${exifData.GPSLatitude},${exifData.GPSLongitude}`;
      locationData[t("fields.mapLink")] = mapsUrl;
    }
    if (exifData.GPSAltitude) locationData[t("fields.altitude")] = `${exifData.GPSAltitude}m`;
    if (exifData.GPSDateStamp) locationData[t("fields.gpsDate")] = formatDate(exifData.GPSDateStamp);
    if (exifData.GPSSpeed) locationData[t("fields.gpsSpeed")] = `${exifData.GPSSpeed} km/h`;
    if (exifData.GPSImgDirection) locationData[t("fields.gpsDirection")] = `${exifData.GPSImgDirection}°`;
    if (Object.keys(locationData).length > 0) {
      sections.push({
        title: t("sections.location"),
        data: locationData,
      });
    }

    // ICC Color Profile Information
    const iccData: Record<string, any> = {};
    if (exifData.ICC_Profile) {
      Object.keys(exifData).forEach(key => {
        if (key.startsWith("ICC_") || key.startsWith("ColorSpace")) {
          iccData[key] = exifData[key];
        }
      });
    }
    if (Object.keys(iccData).length > 0) {
      sections.push({
        title: t("sections.colorProfile"),
        data: iccData,
      });
    }

    // IPTC Information (Image metadata standard)
    const iptcData: Record<string, any> = {};
    Object.keys(exifData).forEach(key => {
      if (key.startsWith("IPTC_") || key.startsWith("Keywords") || key.startsWith("Headline") || key.startsWith("Caption")) {
        iptcData[key] = exifData[key];
      }
    });
    if (Object.keys(iptcData).length > 0) {
      sections.push({
        title: t("sections.iptc"),
        data: iptcData,
      });
    }

    // XMP Information (Extensible Metadata Platform)
    const xmpData: Record<string, any> = {};
    Object.keys(exifData).forEach(key => {
      if (key.startsWith("XMP_") || key.startsWith("xmp:")) {
        xmpData[key] = exifData[key];
      }
    });
    if (Object.keys(xmpData).length > 0) {
      sections.push({
        title: t("sections.xmp"),
        data: xmpData,
      });
    }

    // Date/Time Information
    const dateData: Record<string, any> = {};
    if (exifData.DateTimeOriginal) dateData[t("fields.dateTimeOriginal")] = formatDate(exifData.DateTimeOriginal);
    if (exifData.DateTime) dateData[t("fields.dateTime")] = formatDate(exifData.DateTime);
    if (exifData.CreateDate) dateData[t("fields.createDate")] = formatDate(exifData.CreateDate);
    if (exifData.ModifyDate) dateData[t("fields.modifyDate")] = formatDate(exifData.ModifyDate);
    if (Object.keys(dateData).length > 0) {
      sections.push({
        title: t("sections.dateTime"),
        data: dateData,
      });
    }

    // Software Information
    const softwareData: Record<string, any> = {};
    if (exifData.Software) softwareData[t("fields.software")] = exifData.Software;
    if (exifData.Artist) softwareData[t("fields.artist")] = exifData.Artist;
    if (exifData.Copyright) softwareData[t("fields.copyright")] = exifData.Copyright;
    if (Object.keys(softwareData).length > 0) {
      sections.push({
        title: t("sections.software"),
        data: softwareData,
      });
    }

    // All Other EXIF Data
    const otherData: Record<string, any> = {};
    const processedKeys = new Set([
      "ImageWidth", "ImageHeight", "ExifImageWidth", "ExifImageHeight",
      "Make", "Model", "LensMake", "LensModel",
      "ISO", "ExposureTime", "FNumber", "ApertureValue", "FocalLength", "Flash",
      "WhiteBalance", "ExposureMode", "MeteringMode",
      "GPSLatitude", "GPSLongitude", "GPSAltitude", "GPSDateStamp",
      "DateTimeOriginal", "DateTime", "CreateDate", "ModifyDate",
      "Software", "Artist", "Copyright", "Orientation",
    ]);

    for (const key in exifData) {
      if (!processedKeys.has(key) && exifData[key] !== null && exifData[key] !== undefined) {
        otherData[key] = exifData[key];
      }
    }

    if (Object.keys(otherData).length > 0) {
      sections.push({
        title: t("sections.other"),
        data: otherData,
      });
    }

    return sections;
  };

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const selectedFile = files[0] || null;
    setFile(selectedFile);
    setMetadata([]);
    setError(null);

    if (selectedFile) {
      setIsLoading(true);

      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      try {
        // Read all metadata types: EXIF, GPS, ICC, IPTC, XMP
        const allExifData = await exifr.parse(selectedFile, {
          // Enable all metadata types
          exif: true,
          gps: true,
          icc: true,
          iptc: true,
          xmp: true,
          // Get thumbnail if available
          thumbnail: false, // Set to true if you want thumbnail data
          // Merge all outputs into one object
          mergeOutput: true,
          // Sanitize values for better display
          sanitize: true,
          // Don't translate keys/values (keep original)
          translateKeys: false,
          translateValues: false,
          // Include all fields, not just common ones
          pick: undefined, // Get everything
        });

        const organized = organizeMetadata(allExifData || {}, selectedFile);
        setMetadata(organized);
      } catch (err: any) {
        setError(err?.message || t("errors.failedToRead"));
      } finally {
        setIsLoading(false);
      }
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [previewUrl, t]);

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setMetadata([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      <FileUpload
        accept="image/*"
        onFilesSelected={handleFilesSelected}
        maxFiles={1}
      >
        <div className="space-y-2">
          <div className="text-sm font-medium">{t("uploadLabel")}</div>
          <div className="text-xs text-neutral-500">
            {isLoading ? t("loading") : "Drop, click, or paste an image here"}
          </div>
        </div>
      </FileUpload>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {file && previewUrl && !isLoading && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t("preview")}</h2>
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt={t("preview")}
                className="max-w-full max-h-96 rounded-lg border border-neutral-200 dark:border-neutral-800"
              />
            </div>
          </div>

          {/* Metadata Sections */}
          {metadata.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t("metadata")}</h2>
                <Button onClick={handleClear} variant="secondary" size="sm">
                  {t("clear")}
                </Button>
              </div>

              {metadata.map((section, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800"
                >
                  <h3 className="font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(section.data).map(([key, value]) => {
                      const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
                      return (
                        <div key={key} className="space-y-1">
                          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                            {key}
                          </div>
                          <div className="text-sm text-neutral-900 dark:text-neutral-100 break-words">
                            {isUrl ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                {value}
                              </a>
                            ) : (
                              formatValue(value)
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !error && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t("noMetadata")}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {t("info.title")}
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• {t("info.point1")}</li>
          <li>• {t("info.point2")}</li>
          <li>• {t("info.point3")}</li>
          <li>• {t("info.point4")}</li>
        </ul>
      </div>
    </div>
  );
}

