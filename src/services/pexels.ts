'use server'

const BASE = 'https://api.pexels.com/v1/search'
const KEY = process.env.PEXELS_API_KEY

export type PexelsSize = 'grid' | 'full'

function pickSrc (p: any, size: PexelsSize) {
  const s = p?.src || {}
  if (size === 'grid') return s.medium || s.large || s.small || s.original
  return s.large2x || s.large || s.original || s.medium
}

export async function searchPexels (q: string, perPage = 24, size: PexelsSize = 'grid') {
  if (!KEY) return []
  const url = `${BASE}?query=${encodeURIComponent(q)}&per_page=${perPage}`
  const res = await fetch(url, {
    headers: { Authorization: KEY },
    next: { revalidate: 3600, tags: ['images'] }
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.photos ?? []).map((p: any) => ({
    id: `pexels-${p.id}`,
    slug: `pexels-${p.id}`,
    src: pickSrc(p, size),
    width: p.width,
    height: p.height,
    alt: p.alt || q,
    tags: ['pexels', q],
    dominant: '#000000',
    credit: { author: p.photographer, url: p.url, platform: 'pexels' as const }
  }))
}


