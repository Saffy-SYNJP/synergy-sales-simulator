"use client";
import { ScoreState } from "@/lib/scoring";

interface Props {
  score: ScoreState;
}

export default function ScoreTracker({ score }: Props) {
  const pills = [
    { label: "Objection Handled", on: score.objectionHandled },
    { label: "Prospect Qualified", on: score.prospectQualified },
    { label: "White-Label Pitched", on: score.whiteLabelPitched },
    { label: "Visit Close Made", on: score.visitCloseMade },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {pills.map((p) => (
        <div
          key={p.label}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
            p.on
              ? "bg-green-500/20 border-green-500 text-green-300"
              : "bg-navy-surface border-navy-surface text-gray-500"
          }`}
        >
          {p.on ? "✅" : "⚪️"} {p.label}
        </div>
      ))}
    </div>
  );
}
