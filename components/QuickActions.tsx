"use client";
import { Mode } from "@/lib/prompts";

interface Props {
  mode: Mode;
  onPick: (text: string) => void;
}

const PROSPECT = [
  { icon: "📞", label: "Open", text: "Hi, this is the team from Synergy Lubricants. I wanted to introduce you to something that could meaningfully reduce your cost per litre without compromising quality. Do you have 2 minutes?" },
  { icon: "🔍", label: "Qualify", text: "Before I waste your time — can I ask, how many litres per month are you moving right now, and who on your team makes the final decision on supplier changes?" },
  { icon: "🏷️", label: "White-Label", text: "We manufacture EcoMatic with the same specs as Castrol and Shell, and we also white-label under your own brand — we already do this for EcoCrew, HANA and Python. Would owning the brand interest you?" },
  { icon: "🤝", label: "Close", text: "Let me fly to you with physical samples and full packaging — no commitment, no pressure. If you don't like what you see and feel, I leave. That fair?" },
  { icon: "💰", label: "Price", text: "I hear you on price, but let me ask — if the quality is identical to Castrol and you make more margin per litre, is this actually about price or about trust? Let me prove the trust part." },
  { icon: "📄", label: "Certs", text: "We're fully API certified, and I can send TDS and MSDS for every grade today. Would SJ, SL, SM, SN on the petrol side and CI-4 through CK-4 on diesel cover what your customers need?" },
];

const DEMO = [
  { icon: "💰", label: "Price", text: "Your price is too high compared to Castrol or Shell." },
  { icon: "🏷️", label: "Own Brand", text: "I already have my own brand — I don't want to carry another brand." },
  { icon: "📦", label: "Supply", text: "Can you guarantee monthly stock availability? My last supplier kept running out." },
  { icon: "📊", label: "MOQ", text: "Your MOQ is too high — I'm a small operation and can't move that volume." },
  { icon: "🏦", label: "Credit", text: "I need 60-90 day credit terms — upfront payment is impossible for me." },
  { icon: "⏰", label: "Later", text: "This is not a good time — call me again in 3 months." },
  { icon: "🤝", label: "Approval", text: "I need to consult my business partner before making any decision." },
  { icon: "❓", label: "Quality", text: "How do I know your quality is consistent batch to batch?" },
];

const COACH = [
  { icon: "📞", label: "Opening", text: "Coach me on my opening line." },
  { icon: "💰", label: "Price", text: "How do I handle price objections against Castrol and Shell?" },
  { icon: "🏷️", label: "Brand", text: "How do I reframe the 'I already have my own brand' objection?" },
  { icon: "🔧", label: "White-Label", text: "How do I pitch white-label to a distributor?" },
  { icon: "📦", label: "Supply", text: "How do I reassure a prospect worried about supply continuity?" },
  { icon: "🤝", label: "Close", text: "How do I close a skeptical prospect on an in-person visit?" },
  { icon: "🌐", label: "Language", text: "How should I react when a prospect switches to their local language?" },
  { icon: "📄", label: "Certs", text: "How do I leverage API certification and TDS/MSDS in my pitch?" },
];

export default function QuickActions({ mode, onPick }: Props) {
  const items = mode === "prospect" ? PROSPECT : mode === "demo" ? DEMO : COACH;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {items.map((it) => (
        <button
          key={it.label}
          onClick={() => onPick(it.text)}
          className="px-2 py-1 text-[11px] rounded-lg border border-navy-border bg-navy-card text-gray-400 hover:border-gold/40 hover:text-gold active:scale-95 transition-all"
        >
          {it.icon} {it.label}
        </button>
      ))}
    </div>
  );
}
