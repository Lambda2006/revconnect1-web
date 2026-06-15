import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useStripe } from '@stripe/stripe-react-native'
import { useSession } from '@/lib/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { addBoat } from '@/lib/hooks/useGarage'
import { colors, spacing, typography, radius } from '@/lib/theme'

type Step = 'boat' | 'plan' | 'payment'

/**
 * Onboarding flow — blueprint section 7, Auth Flow steps 4–8.
 *
 * Step 1 — Add first boat
 * Step 2 — Choose plan (App Only vs App + Agent)
 * Step 3 — Stripe PaymentSheet — card entry, trial start
 *
 * Payment flow:
 * 1. Call POST /api/create-subscription → get setupIntentClientSecret + ephemeralKey + customerId
 * 2. initPaymentSheet() with those values
 * 3. presentPaymentSheet() → user enters card
 * 4. On success: call POST /api/confirm-subscription to create the Stripe subscription with 7-day trial
 * 5. stripe-webhook fires customer.subscription.created → writes Supabase row
 * 6. useSubscription picks up the new row via Realtime → appAccess becomes true
 * 7. Root layout detects appAccess and routes to (app)/discover
 */
export default function OnboardingScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [step, setStep] = useState<Step>('boat')
  const [loading, setLoading] = useState(false)
  const [includeAgent, setIncludeAgent] = useState(true)

  // Boat form state
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [engineType, setEngineType] = useState('')

  async function handleBoatNext() {
    if (!make.trim() || !model.trim()) {
      Alert.alert('Required', 'Please enter your boat make and model.')
      return
    }
    if (!session?.user.id) return
    setLoading(true)
    try {
      await addBoat(session.user.id, {
        make: make.trim(),
        model: model.trim(),
        year: year ? parseInt(year, 10) : null,
        engine_type: engineType.trim() || null,
        engine_hours: null,
        hull_id: null,
        notes: null,
        is_primary: true,
      })
      setStep('plan')
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save your boat.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Called when user taps "Continue to payment" on the plan step.
   * Fetches SetupIntent from our backend and initialises the PaymentSheet
   * before navigating to the payment step.
   */
  async function handlePlanNext() {
    if (!session?.user?.id || !session?.user?.email) return
    setLoading(true)
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          plan: includeAgent ? 'app_and_agent' : 'app_only',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.returningUser) {
          Alert.alert(
            'Trial already used',
            'Your free trial has already been used on this account. Visit victoryrevconnect.com/pricing to purchase directly.',
            [{ text: 'OK' }]
          )
          return
        }
        throw new Error(data.error ?? 'Failed to initialise payment')
      }

      const { error: initError } = await initPaymentSheet({
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKey,
        setupIntentClientSecret: data.setupIntentClientSecret,
        merchantDisplayName: 'VictoryRevConnect Boaters',
        allowsDelayedPaymentMethods: false,
        appearance: {
          colors: {
            primary: colors.navy,
            background: colors.background,
            componentBackground: colors.white,
            componentBorder: colors.border,
            primaryText: colors.textPrimary,
          },
        },
      })

      if (initError) throw new Error(initError.message)
      setStep('payment')
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not initialise payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Presents the Stripe PaymentSheet. On success, calls confirm-subscription
   * to create the trial subscription. The Stripe webhook will fire and write
   * the Supabase row — useSubscription picks it up via Realtime, root layout
   * routes to (app)/discover.
   */
  const handlePaymentConfirm = useCallback(async () => {
    if (!session?.user?.id || !session?.user?.email) return
    setLoading(true)
    try {
      const { error: presentError } = await presentPaymentSheet()
      if (presentError) {
        if (presentError.code === 'Canceled') {
          // User dismissed sheet — not an error, just stay on payment step
          return
        }
        throw new Error(presentError.message)
      }

      // Card confirmed — create the subscription with trial
      // customerId is resolved server-side in confirm-subscription via Stripe customer search
      const res = await fetch('/api/confirm-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          plan: includeAgent ? 'app_and_agent' : 'app_only',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to activate subscription')

      // Subscription created — Realtime will fire useSubscription and root layout will redirect
      // Show a brief loading state while we wait for the webhook to write Supabase
    } catch (err: any) {
      Alert.alert('Payment error', err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [session, includeAgent, presentPaymentSheet])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === 'boat' && (
          <BoatStep
            make={make} setMake={setMake}
            model={model} setModel={setModel}
            year={year} setYear={setYear}
            engineType={engineType} setEngineType={setEngineType}
            loading={loading}
            onNext={handleBoatNext}
          />
        )}

        {step === 'plan' && (
          <PlanStep
            includeAgent={includeAgent}
            setIncludeAgent={setIncludeAgent}
            loading={loading}
            onNext={handlePlanNext}
          />
        )}

        {step === 'payment' && (
          <PaymentStep
            includeAgent={includeAgent}
            loading={loading}
            onConfirm={handlePaymentConfirm}
            onBack={() => setStep('plan')}
          />
        )}
      </ScrollView>

      {/* Step indicator */}
      <View style={styles.stepper}>
        {(['boat', 'plan', 'payment'] as Step[]).map((s) => (
          <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BoatStep({ make, setMake, model, setModel, year, setYear, engineType, setEngineType, loading, onNext }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add your boat</Text>
      <Text style={styles.stepSubtitle}>
        We use this to pull model-specific documentation for your AI mechanic.
      </Text>
      <View style={styles.form}>
        <InputField label="Make *" value={make} onChange={setMake} placeholder="e.g. Mastercraft" />
        <InputField label="Model *" value={model} onChange={setModel} placeholder="e.g. X24" />
        <InputField label="Year" value={year} onChange={setYear} placeholder="e.g. 2022" keyboardType="number-pad" />
        <InputField label="Engine type" value={engineType} onChange={setEngineType} placeholder="e.g. Ilmor 6.0L" />
      </View>
      <Button label="Continue" variant="primary" size="lg" fullWidth loading={loading} onPress={onNext} />
    </View>
  )
}

function PlanStep({ includeAgent, setIncludeAgent, loading, onNext }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose your plan</Text>
      <Text style={styles.stepSubtitle}>
        Both options include a 7-day free trial. You won't be charged until day 8.
      </Text>

      <View style={styles.planCard}>
        <Text style={styles.planName}>App Only</Text>
        <Text style={styles.planPrice}>$4.99 on day 8</Text>
        <Text style={styles.planDetail}>Meetup discovery, social features, garage</Text>
      </View>

      <View style={[styles.planCard, includeAgent && styles.planCardSelected]}>
        <View style={styles.planRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>App + Agent</Text>
            <Text style={styles.planPrice}>$4.99 + $9.99/mo on day 8</Text>
            <Text style={styles.planDetail}>
              Everything in App Only, plus the AI mechanic agent — model-specific diagnostics,
              repair walkthroughs, part numbers
            </Text>
          </View>
          <Switch
            value={includeAgent}
            onValueChange={setIncludeAgent}
            trackColor={{ true: colors.navy }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <Text style={styles.trialNote}>
        You can remove the agent subscription at any point during days 1–7.
        App fee of $4.99 charges on day 8 regardless.
      </Text>

      <Button
        label="Continue to payment"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        onPress={onNext}
      />
    </View>
  )
}

function PaymentStep({ includeAgent, loading, onConfirm, onBack }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add payment method</Text>
      <Text style={styles.stepSubtitle}>
        Your card will not be charged until day 8.
        {includeAgent
          ? '\n\n$4.99 app fee + $9.99/mo agent subscription charges on day 8.'
          : '\n\n$4.99 app fee charges on day 8.'}
      </Text>

      <View style={styles.trialCallout}>
        <Text style={styles.trialCalloutTitle}>7-day free trial</Text>
        <Text style={styles.trialCalloutBody}>
          Full access starts now. Your card is saved but not charged. Cancel anytime before day 8 — no charge.
        </Text>
      </View>

      <Button
        label={loading ? 'Processing…' : 'Add card & start trial'}
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        onPress={onConfirm}
      />

      <View style={styles.stripeInfo}>
        <Text style={styles.stripeInfoText}>🔒 Secured by Stripe</Text>
      </View>

      <Button label="← Change plan" variant="ghost" size="sm" onPress={onBack} />
    </View>
  )
}

function InputField({ label, value, onChange, placeholder, keyboardType }: any) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.xl },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: typography.xxl, fontWeight: typography.bold, color: colors.textNavy, marginBottom: spacing.xs },
  stepSubtitle: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: typography.sm * 1.6 },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  fieldContainer: { gap: spacing.xs },
  fieldLabel: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textPrimary },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: typography.base, color: colors.textPrimary, backgroundColor: colors.white,
  },
  planCard: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  planCardSelected: { borderColor: colors.navy, backgroundColor: '#F0F4FA' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planName: { fontSize: typography.md, fontWeight: typography.bold, color: colors.textNavy },
  planPrice: { fontSize: typography.sm, color: colors.red, fontWeight: typography.semibold, marginBottom: spacing.xs },
  planDetail: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.5 },
  trialNote: { fontSize: typography.xs, color: colors.textTertiary, lineHeight: typography.xs * 1.6, marginBottom: spacing.xl },
  trialCallout: {
    backgroundColor: '#EEF4FF', borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.xl,
  },
  trialCalloutTitle: { fontSize: typography.md, fontWeight: typography.bold, color: colors.navy, marginBottom: spacing.xs },
  trialCalloutBody: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.5 },
  stripeInfo: { alignItems: 'center', paddingVertical: spacing.sm },
  stripeInfoText: { fontSize: typography.xs, color: colors.textTertiary },
  stepper: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, paddingBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.navy, width: 24 },
})
