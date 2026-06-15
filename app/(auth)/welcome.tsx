import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography } from '@/lib/theme'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          {/* Wordmark: "Rev" white, "Connect" red, "1" black, "Boaters" navy */}
          <Text style={styles.wordmark}>
            <Text style={styles.rev}>Rev</Text>
            <Text style={styles.connect}>Connect</Text>
            <Text style={styles.one}>1</Text>
            {'\n'}
            <Text style={styles.boaters}>Boaters</Text>
          </Text>
          <Text style={styles.tagline}>
            Connect on the water.{'\n'}Know your boat.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow icon="⚓" label="Discover meetups with boaters near you" />
          <FeatureRow icon="🔧" label="AI mechanic agent — model-specific diagnostics" />
          <FeatureRow icon="📍" label="Real manufacturer documentation. No guesswork." />
        </View>

        <View style={styles.actions}>
          <Button
            label="Get started — 7 days free"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            size="md"
            fullWidth
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          />
        </View>

        <Text style={styles.billingNote}>
          Card required. $4.99 app fee + optional $9.99/mo agent subscription
          charged on day 8. Cancel anytime during trial.
        </Text>
      </View>
    </SafeAreaView>
  )
}

function FeatureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={featureStyles.row}>
      <Text style={featureStyles.icon}>{icon}</Text>
      <Text style={featureStyles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center' },
  wordmark: { textAlign: 'center', fontSize: 40, lineHeight: 48, marginBottom: spacing.md },
  rev: { color: colors.white, fontWeight: '800' },
  connect: { color: colors.red, fontWeight: '800' },
  one: { color: colors.nearBlack, fontWeight: '800' },
  boaters: { color: '#4A90B8', fontWeight: '700', fontSize: 32 },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.md,
    textAlign: 'center',
    lineHeight: typography.md * 1.5,
  },
  features: { gap: spacing.md },
  actions: { gap: spacing.sm },
  loginButton: { marginTop: spacing.xs },
  billingNote: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: typography.xs,
    textAlign: 'center',
    lineHeight: typography.xs * 1.6,
    marginTop: spacing.sm,
  },
})

const featureStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 24, width: 32 },
  label: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: typography.base, lineHeight: typography.base * 1.4 },
})
