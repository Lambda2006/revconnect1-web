import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from './client'
import type { UserRow } from '@/types'

// Required for expo-auth-session to properly dismiss the browser on iOS
// after the OAuth redirect completes. Call at module level.
WebBrowser.maybeCompleteAuthSession()

// =====================
// EMAIL AUTH
// =====================

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// =====================
// PASSWORD RESET
// Two-step: request email → user taps link → app opens callback
// → session set with type=recovery → route to reset-password screen
// → user enters new password → updatePassword called
// =====================

export async function resetPassword(email: string) {
  const redirectTo = makeRedirectUri({
    scheme: 'victoryrevconnectboaters',
    path: 'auth/callback',
  })
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// =====================
// EMAIL VERIFICATION
// Called from callback.tsx after the user taps the confirmation link.
// Supabase PKCE flow: the link contains a `code` query param.
// =====================

export async function exchangeCodeForSession(codeOrUrl: string) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(codeOrUrl)
  if (error) throw error
  return data
}

// =====================
// GOOGLE OAUTH
// Uses expo-auth-session + WebBrowser.openAuthSessionAsync.
//
// SETUP REQUIRED in Supabase dashboard → Authentication → URL Configuration:
//   Add both redirect URIs to the allowlist:
//     - victoryrevconnectboaters://auth/callback    (production / EAS builds)
//     - exp://*/--/auth/callback             (Expo Go — wildcard, for dev)
//
// makeRedirectUri() auto-detects Expo Go vs. standalone and returns the
// correct URI for the current environment.
// =====================

export async function signInWithGoogle(): Promise<'success' | 'canceled'> {
  const redirectTo = makeRedirectUri({
    scheme: 'victoryrevconnectboaters',
    path: 'auth/callback',
  })

  // Step 1: Get the OAuth URL from Supabase without auto-redirecting
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // skipBrowserRedirect: true tells Supabase to return the URL
      // instead of opening it — we open it ourselves via WebBrowser
      skipBrowserRedirect: true,
    },
  })

  if (error) throw error
  if (!data.url) throw new Error('No OAuth URL returned from Supabase')

  // Step 2: Open the Google OAuth consent page in an in-app browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

  if (result.type === 'cancel' || result.type === 'dismiss') {
    // User closed the browser without completing sign-in — not an error
    return 'canceled'
  }

  if (result.type === 'success' && result.url) {
    // Step 3: Exchange the auth code in the redirect URL for a Supabase session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      result.url
    )
    if (sessionError) throw sessionError
    return 'success'
  }

  return 'canceled'
}

// =====================
// USER PROFILE
// =====================

export async function createUserRecord(
  userId: string,
  email: string,
  displayName?: string
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      display_name: displayName ?? email.split('@')[0],
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserRecord(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null // row not found
    throw error
  }
  return data
}

export async function updateUserRecord(
  userId: string,
  updates: Partial<Omit<UserRow, 'id' | 'created_at'>>
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
