import type { ImageItem } from '../domain/image'

export const gallery: ImageItem[] = [
  {
    id: 'next-logo',
    slug: 'next-logo',
    src: '/next.svg',
    width: 180,
    height: 38,
    alt: 'Next.js logo',
    tags: ['brand','ui'],
    dominant: '#ffffff'
  },
  {
    id: 'window-icon',
    slug: 'window-icon',
    src: '/window.svg',
    width: 64,
    height: 64,
    alt: 'Window icon',
    tags: ['icon','ui'],
    dominant: '#c1c1c1'
  },
  {
    id: 'globe-icon',
    slug: 'globe-icon',
    src: '/globe.svg',
    width: 64,
    height: 64,
    alt: 'Globe icon',
    tags: ['icon','world'],
    dominant: '#c1c1c1'
  },
  {
    id: 'file-icon',
    slug: 'file-icon',
    src: '/file.svg',
    width: 64,
    height: 64,
    alt: 'File icon',
    tags: ['icon','doc'],
    dominant: '#c1c1c1'
  }
]


