import type { NewsItem } from './types'

type HNItem = {
  id: number
  by?: string
  title?: string
  url?: string
  score?: number
  descendants?: number
  time?: number
}

const BASE = 'https://hacker-news.firebaseio.com/v0'

function unixToIso(unixSeconds?: number) {
  if (!unixSeconds) return undefined
  return new Date(unixSeconds * 1000).toISOString()
}

export async function fetchHackerNewsTop(limit = 30): Promise<NewsItem[]> {
  const idsRes = await fetch(`${BASE}/topstories.json`)
  if (!idsRes.ok) throw new Error('Failed to load Hacker News top stories')
  const ids = (await idsRes.json()) as number[]

  const selected = ids.slice(0, limit)
  const items = await Promise.all(
    selected.map(async (id) => {
      const r = await fetch(`${BASE}/item/${id}.json`)
      if (!r.ok) return null
      const raw = (await r.json()) as HNItem
      if (!raw?.title) return null
      return {
        id: String(raw.id),
        source: 'hackernews',
        title: raw.title,
        url: raw.url ?? `https://news.ycombinator.com/item?id=${raw.id}`,
        author: raw.by,
        points: raw.score,
        commentCount: raw.descendants,
        publishedAt: unixToIso(raw.time),
      } satisfies NewsItem
    })
  )

  return items.filter(Boolean) as NewsItem[]
}

