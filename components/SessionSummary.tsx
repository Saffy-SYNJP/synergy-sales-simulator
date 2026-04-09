"use client";

export interface SummaryData {
  overallScore: number;
  pills: {
    objectionHandled: boolean;
    prospectQualified: boolean;
    whiteLabelPitched: boolean;
    visitCloseMade: boolean;
  };
  objectionRating: string;
  objectionNotes: string;
  topThingsDoneWell: string[];
  topThingsToImprove: { issue: string; script: string }[];
  recommendedNextSession: string;
}

interface Props {
  summary: SummaryData;
  onPracticeAgain: () => void;
  onNewSession: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-accent-green" : score >= 60 ? "text-gold" : "text-accent-red";
  const border = score >= 80 ? "border-accent-green/40" : score >= 60 ? "border-gold/40" : "border-accent-red/40";
  const bg = score >= 80 ? "bg-accent-green/5" : score >= 60 ? "bg-gold/5" : "bg-accent-red/5";
  return (
    <div className={`w-20 h-20 rounded-2xl border-2 ${border} ${bg} flex flex-col items-center justify-center flex-shrink-0`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-gray-500">/100</span>
    </div>
  );
}

const PILL_LABELS: Record<keyof SummaryData["pills"], string> = {
  objectionHandled: "Objection",
  prospectQualified: "Qualified",
  whiteLabelPitched: "White-Label",
  visitCloseMade: "Visit Close",
};

const RATING_COLOR: Record<string, string> = {
  Excellent: "text-accent-green bg-accent-green/10 border-accent-green/30",
  Good: "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  "Needs Work": "text-gold bg-gold/10 border-gold/30",
  Missed: "text-accent-red bg-accent-red/10 border-accent-red/30",
};

export default function SessionSummary({ summary, onPracticeAgain, onNewSession }: Props) {
  const pillKeys = Object.keys(summary.pills) as Array<keyof SummaryData["pills"]>;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score + Rating */}
      <div className="flex items-center gap-4">
        <ScoreRing score={summary.overallScore} />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gradient-gold">Session Complete</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${RATING_COLOR[summary.objectionRating] ?? "text-gray-400 bg-navy-card border-navy-border"}`}>
              {summary.objectionRating}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{summary.objectionNotes}</p>
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5">
        {pillKeys.map((k) => (
          <div key={k} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            summary.pills[k] ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : "bg-navy-card border-navy-border text-gray-600"
          }`}>
            {summary.pills[k] ? "✅" : "○"} {PILL_LABELS[k]}
          </div>
        ))}
      </div>

      {/* Done Well */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Done Well</h3>
        <div className="space-y-1.5">
          {summary.topThingsDoneWell.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-300 bg-accent-green/5 border border-accent-green/10 rounded-xl px-3 py-2">
              <span className="text-accent-green font-bold flex-shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* To Improve */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Improve</h3>
        <div className="space-y-2">
          {summary.topThingsToImprove.map((item, i) => (
            <div key={i} className="bg-accent-red/5 border border-accent-red/10 rounded-xl px-3 py-2.5 space-y-1.5">
              <div className="flex gap-2 text-sm text-gray-300">
                <span className="text-accent-red font-bold flex-shrink-0">{i + 1}.</span>
                <span>{item.issue}</span>
              </div>
              <div className="text-xs text-gold bg-gold/5 rounded-lg px-2.5 py-1.5 border border-gold/15">
                💬 &ldquo;{item.script}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Session */}
      <div className="glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Session</h3>
        <p className="text-sm text-gray-300">{summary.recommendedNextSession}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button onClick={onPracticeAgain} className="flex-1 py-3 rounded-xl border border-navy-border bg-navy-card text-gray-300 text-sm font-semibold hover:border-gold/40 hover:text-gold transition-all active:scale-[0.98]">
          🔁 Same Scenario
        </button>
        <button onClick={onNewSession} className="flex-1 py-3 rounded-xl bg-gradient-gold text-navy-DEFAULT text-sm font-bold hover:shadow-glow active:scale-[0.98] transition-all">
          ✨ New Session
        </button>
      </div>
    </div>
  );
}
