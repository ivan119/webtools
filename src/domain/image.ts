export type ImageItem = {
  id: string
  slug: string
  src: string
  width: number
  height: number
  alt: string
  tags: string[]
  dominant: `#${string}`
  credit?: { author: string, url: string, platform: 'pexels' }
}


