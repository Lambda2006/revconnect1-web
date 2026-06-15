/**
 * lib/agent/media.ts
 *
 * Web-native media helpers for the agent. Replaces expo-av and expo-image-picker.
 * - Image: browser file input → upload to Supabase agent-media bucket
 * - Voice: MediaRecorder API → POST to /api/transcribe → text
 */
import { createClient } from "@/lib/supabase/client";

export type UserInput = {
  text: string;
  imageUrl?: string;
  imageB64?: string;
  transcript?: string;
};

/**
 * Uploads a File/Blob to the agent-media Supabase storage bucket.
 * Returns the signed URL + base64 string for Claude vision API.
 */
export async function uploadAgentImage(
  userId: string,
  file: File
): Promise<{ url: string; base64: string } | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("agent-media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("Image upload error:", error.message);
    return null;
  }

  const { data: signedData } = await supabase.storage
    .from("agent-media")
    .createSignedUrl(path, 3600);

  const url = signedData?.signedUrl ?? "";

  // Convert to base64 for Claude vision
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return { url, base64 };
}

/**
 * Sends an audio Blob (from MediaRecorder) to /api/transcribe.
 * Returns the transcript string or null on failure.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const { transcript } = await res.json();
    return transcript ?? null;
  } catch {
    return null;
  }
}
