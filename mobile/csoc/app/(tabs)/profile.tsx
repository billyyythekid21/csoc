import { StyleSheet } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function ProfileScreen() {
  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#EDEDED', dark: '#1F1F1F' }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText>
          Next: we’ll add sign in, username, interests, and a public profile people can message.
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

