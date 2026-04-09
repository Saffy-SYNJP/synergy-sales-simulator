"use client";
import { Market, MarketId } from "@/lib/markets";

interface Props {
  value: MarketId | null;
  onChange: (m: MarketId) => void;
  markets: Market[];
}

export default function MarketSelector({ value, onChange, markets }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {markets.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`relative p-3 rounded-xl border text-left transition-all active:scale-[0.97] ${
              active
                ? "border-gold bg-gold/10 shadow-glow-sm"
                : "border-navy-border bg-navy-card hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-1.5">{m.flag}</div>
            <div className="font-semibold text-xs leading-tight">{m.country}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 truncate">{m.personaName}</div>
          </button>
        );
      })}
    </div>
  );
}
