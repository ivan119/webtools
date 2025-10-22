'use server'

import { unstable_cache } from 'next/cache'
import { searchPexels } from '../services/pexels'
import { gallery } from '../data/gallery'
import type { ImageItem } from '../domain/image'

export type GetImagesOpts = { tag?: string, limit?: number }

async function fetchAll (): Promise<ImageItem[]> {
  const cinematic = await searchPexels('cinematic portrait', 24, 'grid')
  const night = await searchPexels('night architecture', 24, 'grid')
  return [...cinematic, ...night, ...gallery]
}

const cachedAll = unstable_cache(fetchAll, ['images-all'], { revalidate: 3600, tags: ['images'] })

export async function getImages ({ tag, limit = 48 }: GetImagesOpts = {}) {
  const items = await cachedAll()
  const filtered = tag ? items.filter(i => i.tags.includes(tag)) : items
  return filtered.slice(0, limit)
}


