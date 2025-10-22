'use server'

import { gallery } from '../data/gallery'
import type { ImageItem } from '../domain/image'
import { getImages } from '../lib/images'

export async function listImages ({ tag }: { tag?: string }): Promise<ImageItem[]> {
  const items = gallery
  if (!items || items.length === 0) return []
  if (!tag) return items
  return items.filter(i => i.tags.includes(tag))
}

export async function getBySlug (slug: string): Promise<ImageItem | null> {
  if (!slug) return null
  const item = gallery.find(i => i.slug === slug)
  return item ?? null
}

export async function listRemoteImages (): Promise<ImageItem[]> {
  return getImages()
}

export async function listAllImages ({ tag }: { tag?: string }): Promise<ImageItem[]> {
  return getImages({ tag })
}


