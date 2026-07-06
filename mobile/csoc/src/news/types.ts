export type NewsSource = 'hackernews'

export type NewsItem = {
  id: string
  source: NewsSource
  title: string
  url: string
  author?: string
  points?: number
  commentCount?: number
  publishedAt?: string
}

