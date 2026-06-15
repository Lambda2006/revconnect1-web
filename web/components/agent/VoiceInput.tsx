"use client";

import React, { useRef, useState } from "react";
import { transcribeAudio } from "@/lib/agent/media";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type RecordState = "idle" | "recording" | "transcribing";

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [state, setState] = useState<RecordState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("transcribing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const transcript = await transcribeAudio(blob);
        setState("idle");
        if (transcript) onTranscript(transcript);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setState("recording");
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const label = state === "recording" ? "Stop" : state === "transcribing" ? "..." : "🎤";

  return (
    <button
      type="button"
      disabled={disabled || state === "transcribing"}
      onPointerDown={state === "idle" ? startRecording : undefined}
      onPointerUp={state === "recording" ? stopRecording : undefined}
      className={[
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
        state === "recording"
          ? "bg-brand-red text-white animate-pulse"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        (disabled || state === "transcribing") ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      title="Hold to record voice"
    >
      {label}
    </button>
  );
}
