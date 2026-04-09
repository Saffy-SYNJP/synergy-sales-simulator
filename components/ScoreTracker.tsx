"use client";
import { ScoreState } from "@/lib/scoring";

interface Props {
  score: ScoreState;
}

export default function ScoreTracker({ score }: Props) {
  const pills = [
    { label: "Objection", on: score.objectionHandled },
    { label: "Qualified", on: score.prospectQualified },
    { label: "White-Label", on: score.whiteLabelPitched },
    { label: "Visit Close", on: score.visitCloseMade },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {pills.map((p) => (
        <div
          key={p.label}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
            p.on
              ? "bg-accent-green/15 border border-accent-green/40 text-accent-green"
              : "bg-navy-card border border-navy-border text-gray-600"
          }`}
        >
          {p.on ? "✅" : "○"} {p.label}
        </div>
      ))}
    </div>
  );
}
