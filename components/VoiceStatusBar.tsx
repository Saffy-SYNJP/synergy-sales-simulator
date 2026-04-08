"use client";

interface Props {
  listening: boolean;
  processing: boolean;
  speaking: boolean;
  level: number;
  latencyMs?: number;
}

export default function VoiceStatusBar({
  listening,
  processing,
  speaking,
  level,
  latencyMs,
}: Props) {
  let label = "⏸ Paused";
  if (listening) label = "🎤 Listening";
  else if (processing) label = "🔄 Processing";
  else if (speaking) label = "🔊 Speaking";

  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 bg-navy-surface rounded px-3 py-1.5">
      <span>{label}</span>
      {listening && (
        <div className="flex items-center gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-gold rounded-sm transition-all"
              style={{
                height: `${Math.max(3, level * 16 * (0.6 + 0.4 * Math.sin(Date.now() / 100 + i)))}px`,
              }}
            />
          ))}
        </div>
      )}
      {latencyMs !== undefined && (
        <span className="text-gray-500 ml-auto">{latencyMs}ms</span>
      )}
    </div>
  );
}
