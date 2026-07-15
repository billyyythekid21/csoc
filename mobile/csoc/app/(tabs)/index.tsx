import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'

import { fetchHackerNewsTop } from '@/src/news/hackernews'
import { summarize } from '@/src/news/summaries'
import type { NewsItem } from '@/src/news/types'

export default function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHackerNewsTop(30)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const header = useMemo(() => {
    if (loading) return 'Loading latest tech + AI news…'
    if (error) return `Error: ${error}`
    return 'Latest Tech + AI News'
  }, [loading, error])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<IconSymbol size={220} name="newspaper.fill" color="rgba(255,255,255,0.75)" />}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">{header}</ThemedText>

        {!loading && (
          <Pressable onPress={() => void load()} style={styles.refreshBtn}>
            <ThemedText type="defaultSemiBold">Refresh</ThemedText>
          </Pressable>
        )}

        {items.map((item) => (
          <ThemedView key={item.id} style={styles.card}>
            <ThemedText type="subtitle">{item.title}</ThemedText>
            <ThemedText>{summarize(item)}</ThemedText>
            <ThemedText type="link">{item.url}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 16,
  },
  refreshBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.35)',
  },
  card: {
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.18)',
  },
})
