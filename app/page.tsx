"use client";
import { useState } from "react";
import ModeSelector from "@/components/ModeSelector";
import MarketSelector from "@/components/MarketSelector";
import ObjectionPicker, { ObjectionSelection } from "@/components/ObjectionPicker";
import ChatPanel from "@/components/ChatPanel";
import { Mode } from "@/lib/prompts";
import { MarketId } from "@/lib/markets";

export default function Home() {
  const [mode, setMode] = useState<Mode>("prospect");
  const [marketId, setMarketId] = useState<MarketId | null>(null);
  const [objection, setObjection] = useState<ObjectionSelection>({ kind: "none" });

  return (
    <main className="min-h-screen max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gold">
          Synergy Sales Training Engine
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Bilingual B2B sales roleplay · EcoMatic · White-Label · Hormozi framework
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Setup sidebar */}
        <aside className="space-y-4">
          <section>
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
              1. Mode
            </h2>
            <ModeSelector value={mode} onChange={setMode} />
          </section>

          {mode !== "coach" && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                2. Market
              </h2>
              <MarketSelector value={marketId} onChange={setMarketId} />
            </section>
          )}

          {mode === "prospect" && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                3. Objection (optional)
              </h2>
              <ObjectionPicker value={objection} onChange={setObjection} />
            </section>
          )}
        </aside>

        {/* Chat area */}
        <section className="h-[calc(100vh-140px)] min-h-[600px]">
          <ChatPanel mode={mode} marketId={marketId} objection={objection} />
        </section>
      </div>
    </main>
  );
}
