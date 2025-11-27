export type ToolCategory = 'images' | 'text' | 'seo' | 'other';

export type ToolItem = {
  id: string;
  title: string;
  desc: string;
  href: string;
  category: ToolCategory;
};

export const tools: ToolItem[] = [
  { id: 'png-to-jpg', title: 'PNG → JPG Converter', desc: 'Convert PNG images to JPG quickly.', href: '/tools?tool=png-to-jpg', category: 'images' },
  { id: 'jpeg-to-png', title: 'JPEG → PNG Converter', desc: 'Lossless image conversion fast.', href: '/tools?tool=jpeg-to-png', category: 'images' },
  { id: 'compress-image', title: 'Image Compressor', desc: 'Reduce image size with adjustable quality.', href: '/tools?tool=compress-image', category: 'images' },
  { id: 'svg-to-webp', title: 'SVG → WEBP Converter', desc: 'Convert SVGs to WEBP with quality control.', href: '/tools?tool=svg-to-webp', category: 'images' },
  { id: 'image-to-svg', title: 'Image → SVG Converter', desc: 'Wrap a raster in pixel-perfect SVG.', href: '/tools?tool=image-to-svg', category: 'images' },
  { id: 'word-counter', title: 'Word Counter', desc: 'Count words and characters instantly.', href: '/tools?tool=word-counter', category: 'text' },
  { id: 'image-resizer', title: 'Image Resizer', desc: 'Resize images for web and social.', href: '/tools?tool=image-resizer', category: 'images' },
  { id: 'meta-preview', title: 'Meta Tag Preview', desc: 'Preview how your page looks in SERP.', href: '/tools?tool=meta-preview', category: 'seo' },
  { id: 'hash-generator', title: 'Hash Generator', desc: 'Generate secure hashes (SHA, MD5).', href: '/tools?tool=hash-generator', category: 'other' },
  { id: 'png-to-ico', title: 'PNG → ICO Converter', desc: 'Turn PNG images into ICO icons.', href: '/tools?tool=png-to-ico', category: 'images' },
  { id: 'webp-to-png', title: 'WEBP → PNG Converter', desc: 'Convert WebP images to PNG.', href: '/tools?tool=webp-to-png', category: 'images' },
  { id: 'webp-to-jpg', title: 'WEBP → JPG Converter', desc: 'Convert WebP images to JPG.', href: '/tools?tool=webp-to-jpg', category: 'images' },
  { id: 'heic-to-jpg', title: 'HEIC → JPG Converter', desc: 'Convert iPhone HEIC photos to JPG.', href: '/tools?tool=heic-to-jpg', category: 'images' },
  { id: 'avif-to-jpg', title: 'AVIF → JPG Converter', desc: 'Convert AVIF images to JPG.', href: '/tools?tool=avif-to-jpg', category: 'images' },
  { id: 'jpg-to-avif', title: 'JPG → AVIF Converter', desc: 'Convert JPG to modern AVIF format.', href: '/tools?tool=jpg-to-avif', category: 'images' },
  { id: 'json-formatter', title: 'JSON Formatter', desc: 'Pretty-print and validate JSON.', href: '/tools?tool=json-formatter', category: 'text' },
  { id: 'qr-code-generator', title: 'QR Code Generator', desc: 'Generate QR codes from text, URLs, or any data.', href: '/tools?tool=qr-code-generator', category: 'other' },
  { id: 'image-metadata-viewer', title: 'Image Metadata Viewer', desc: 'View EXIF and image metadata.', href: '/tools?tool=image-metadata-viewer', category: 'images' }
]


