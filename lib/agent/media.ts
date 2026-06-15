import * as ImagePicker from 'expo-image-picker'
import { Audio } from 'expo-av'
import { supabase } from '@/lib/supabase/client'
import type { UserInput } from '@/types'

// =====================
// IMAGE INPUT
// Blueprint section 8, Step 1
// =====================

/**
 * Opens the image picker and uploads the selected image to the agent-media
 * private bucket. Returns the signed URL + base64 for Claude's vision API.
 *
 * File path convention: {userId}/{sessionId}/{timestamp}.jpg
 * This matches the storage RLS policy which scopes access to {userId}/...
 */
export async function pickAndUploadImage(
  userId: string,
  sessionId: string
): Promise<Pick<UserInput, 'imageUrl' | 'imageB64'> | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    base64: true,
    allowsEditing: true,
  })

  if (result.canceled || !result.assets[0]) return null

  const asset = result.assets[0]
  const fileName = `${userId}/${sessionId}/${Date.now()}.jpg`

  // Convert URI to blob for upload
  const response = await fetch(asset.uri)
  const blob = await response.blob()

  const { error: uploadError } = await supabase.storage
    .from('agent-media')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (uploadError) throw uploadError

  // Create signed URL valid for 1 hour (for display in chat)
  const { data: signedData } = await supabase.storage
    .from('agent-media')
    .createSignedUrl(fileName, 3600)

  return {
    imageUrl: signedData?.signedUrl ?? undefined,
    imageB64: asset.base64 ?? undefined,
  }
}

/**
 * Opens the camera and uploads the captured image.
 */
export async function captureAndUploadImage(
  userId: string,
  sessionId: string
): Promise<Pick<UserInput, 'imageUrl' | 'imageB64'> | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    base64: true,
  })

  if (result.canceled || !result.assets[0]) return null

  const asset = result.assets[0]
  const fileName = `${userId}/${sessionId}/${Date.now()}.jpg`
  const response = await fetch(asset.uri)
  const blob = await response.blob()

  const { error: uploadError } = await supabase.storage
    .from('agent-media')
    .upload(fileName, blob, { contentType: 'image/jpeg' })

  if (uploadError) throw uploadError

  const { data: signedData } = await supabase.storage
    .from('agent-media')
    .createSignedUrl(fileName, 3600)

  return {
    imageUrl: signedData?.signedUrl ?? undefined,
    imageB64: asset.base64 ?? undefined,
  }
}

// =====================
// VOICE INPUT
// Blueprint section 8, Step 1
// Audio is NOT stored — transcription only
// =====================

let recording: Audio.Recording | null = null

export async function startVoiceRecording(): Promise<void> {
  await Audio.requestPermissionsAsync()
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  })
  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  )
  recording = rec
}

export async function stopVoiceRecordingAndTranscribe(
  apiBaseUrl: string
): Promise<string | null> {
  if (!recording) return null

  await recording.stopAndUnloadAsync()
  const uri = recording.getURI()
  recording = null

  if (!uri) return null

  // Send to transcribe+api.ts endpoint (Whisper)
  // Audio file is sent directly and NOT stored in Supabase
  const formData = new FormData()
  formData.append('audio', {
    uri,
    type: 'audio/m4a',
    name: 'voice.m4a',
  } as unknown as Blob)

  try {
    const res = await fetch(`${apiBaseUrl}/api/transcribe`, {
      method: 'POST',
      body: formData,
    })
    const { transcript } = await res.json()
    return transcript ?? null
  } catch (err) {
    console.error('[media] transcription failed:', err)
    return null
  }
}
