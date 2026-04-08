"use client";
import { MARKET_LIST, MarketId } from "@/lib/markets";

interface Props {
  value: MarketId | null;
  onChange: (m: MarketId) => void;
}

export default function MarketSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {MARKET_LIST.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="p-4 rounded-lg border-2 text-left transition"
            style={{
              borderColor: active ? "#C9A227" : "#1e304d",
              background: active ? "#C9A22720" : "#1e304d",
            }}
          >
            <div className="text-3xl">{m.flag}</div>
            <div className="font-semibold text-sm mt-2">{m.country}</div>
            <div className="text-xs text-gray-400 mt-1">{m.personaName}</div>
            <div className="text-xs text-gray-500">{m.role}</div>
          </button>
        );
      })}
    </div>
  );
}
