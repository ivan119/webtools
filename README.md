# WebTools - Universal Tools 2099

A modern, privacy-focused collection of web utilities that run entirely client-side. Convert, format, preview, and optimize files directly in your browser—no uploads, no sign-in required.

## 🌟 Features

- **Privacy-First**: All processing happens client-side in your browser
- **Multi-Language Support**: Available in English, German, Spanish, and Italian
- **Modern UI**: Neon-styled, cyberpunk-inspired interface with smooth animations
- **Command Palette**: Quick tool access via `Ctrl+K` / `Cmd+K`
- **17+ Tools**: Comprehensive set of utilities organized by category

## 🛠️ Available Tools

### Image Tools
- PNG ↔ JPG Converter
- JPEG → PNG Converter
- Image Compressor (with adjustable quality)
- SVG ↔ WEBP Converter
- Image → SVG Converter
- Image Resizer (for web and social media)
- PNG → ICO Converter
- WEBP → PNG/JPG Converter
- HEIC → JPG Converter (iPhone photos)
- AVIF ↔ JPG Converter

### Text Tools
- Word Counter
- JSON Formatter & Validator

### SEO Tools
- Meta Tag Preview (SERP preview)

### Other Tools
- Hash Generator (SHA, MD5)

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI**: React 19, Tailwind CSS 4
- **Internationalization**: next-intl
- **Animations**: Framer Motion
- **Components**: Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Language**: TypeScript

## 📦 Getting Started

### Prerequisites

- Node.js 24.10.0 (managed via Volta)
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## 🌍 Internationalization

The app supports multiple locales:
- English (`en`) - Default
- German (`de`)
- Spanish (`es`)
- Italian (`it`)

Locale switching is available via the language switcher in the navigation bar.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── tools/         # Tool pages
│   │   ├── about/         # About page
│   │   └── contact/       # Contact page
│   └── api/               # API routes
├── components/             # React components
│   ├── chrome/            # Navigation, footer, command palette
│   ├── tools/             # Tool-specific components
│   ├── hero/              # Hero sections
│   ├── gallery/           # Image gallery
│   └── shared/            # Reusable UI components
├── data/                  # Static data (tools list)
├── i18n/                  # Internationalization config
├── lib/                   # Utility functions
└── stores/                # Zustand state stores
```

## 🎨 Key Features

- **Client-Side Processing**: All tools run in the browser for maximum privacy
- **No Backend Required**: Static site generation with Next.js
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessible**: Built with accessibility best practices
- **Fast**: Optimized with Next.js and Turbopack

## 📝 License

Private project - All rights reserved

## 🤝 Contributing

This is a private project. For questions or feedback, please use the contact form in the application.
