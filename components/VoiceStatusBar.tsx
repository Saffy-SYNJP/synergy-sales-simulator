"use client";

interface Props {
  listening: boolean;
  processing: boolean;
  speaking: boolean;
  level: number;
  latencyMs?: number;
}

export default function VoiceStatusBar({ listening, processing, speaking, level, latencyMs }: Props) {
  let label = "⏸ Paused";
  let color = "text-gray-500";
  if (listening) { label = "🎤 Listening"; color = "text-accent-green"; }
  else if (processing) { label = "🔄 Processing"; color = "text-gold"; }
  else if (speaking) { label = "🔊 Speaking"; color = "text-accent-blue"; }

  return (
    <div className="flex items-center gap-3 text-xs glass-card rounded-lg px-3 py-1.5">
      <span className={`font-medium ${color}`}>{label}</span>
      {listening && (
        <div className="flex items-center gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-gold rounded-sm transition-all"
              style={{ height: `${Math.max(3, level * 16 * (0.6 + 0.4 * Math.sin(Date.now() / 100 + i)))}px` }}
            />
          ))}
        </div>
      )}
      {latencyMs !== undefined && <span className="text-gray-600 ml-auto font-mono">{latencyMs}ms</span>}
    </div>
  );
}
