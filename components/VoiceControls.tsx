"use client";

/**
 * VoiceControls — Phase 2 voice UI component.
 * Hidden when NEXT_PUBLIC_VOICE_ENABLED is false.
 * Includes: mic button (hold-to-talk / toggle), recording indicator, mute button, status bar.
 */

interface Props {
  /** Whether the mic is currently recording */
  isRecording: boolean;
  /** Whether AI audio is currently playing */
  isSpeaking: boolean;
  /** Whether transcript is being processed */
  isProcessing: boolean;
  /** Audio input level 0-1 for the visual indicator */
  level?: number;
  onMicToggle: () => void;
  onMute: () => void;
}

export default function VoiceControls({
  isRecording,
  isSpeaking,
  isProcessing,
  level = 0,
  onMicToggle,
  onMute,
}: Props) {
  const statusLabel = isRecording
    ? "Listening…"
    : isProcessing
    ? "Processing…"
    : isSpeaking
    ? "Speaking…"
    : "Ready";

  return (
    <div className="flex items-center gap-3">
      {/* Mic button */}
      <button
        type="button"
        onClick={onMicToggle}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition
          ${
            isRecording
              ? "bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.25)]"
              : "bg-gold text-navy hover:bg-gold/90"
          }`}
      >
        🎤
        {/* Red recording pulse ring */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
        )}
      </button>

      {/* Level meter bar */}
      <div className="flex-1 h-1.5 bg-navy-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isRecording ? "bg-red-400" : "bg-gold/40"
          }`}
          style={{ width: `${Math.min(100, Math.round(level * 100))}%` }}
        />
      </div>

      {/* Status label */}
      <span
        className={`text-xs min-w-[80px] text-right ${
          isRecording
            ? "text-red-300"
            : isSpeaking
            ? "text-gold"
            : isProcessing
            ? "text-blue-300"
            : "text-gray-500"
        }`}
      >
        {statusLabel}
      </span>

      {/* Mute button — only shown when AI is speaking */}
      {isSpeaking && (
        <button
          type="button"
          onClick={onMute}
          aria-label="Mute AI playback"
          className="px-3 py-1.5 rounded text-xs border border-red-500 text-red-300 bg-red-500/10 hover:bg-red-500/20 transition"
        >
          Mute
        </button>
      )}
    </div>
  );
}
