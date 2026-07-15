import { StyleSheet } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function CommunityScreen() {
  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Community</ThemedText>
        <ThemedText>
          Next: browse tech students, add interests, and start 1:1 chats.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 16,
  },
})
