import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

/**
 * Voice transcription endpoint — blueprint section 8, Step 1.
 * POST /api/transcribe
 *
 * Body: multipart form with audio file
 * Response: { transcript: string }
 *
 * Audio is NOT stored. Only the transcription is returned.
 * Expo audio is recorded in m4a format and passed directly to Whisper.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    })

    return new Response(
      JSON.stringify({ transcript: transcription }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[transcribe+api] error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
