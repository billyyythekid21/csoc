import type { NewsItem } from './types'

// MVP placeholder: quick on-device heuristic summary.
// Later we’ll replace this with real AI summaries stored per-article.
export function summarize(item: NewsItem): string {
  const parts: string[] = []
  if (item.author) parts.push(`By ${item.author}.`)
  if (typeof item.points === 'number') parts.push(`${item.points} points on Hacker News.`)
  if (typeof item.commentCount === 'number') parts.push(`${item.commentCount} comments.`)
  parts.push('Open the article to read the details.')
  return parts.join(' ')
}

