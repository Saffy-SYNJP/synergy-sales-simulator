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
  const colour =
    score >= 80
      ? "text-green-400 border-green-400"
      : score >= 60
      ? "text-gold border-gold"
      : "text-red-400 border-red-400";
  return (
    <div
      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${colour} flex-shrink-0`}
    >
      <span className="text-3xl font-bold">{score}</span>
    </div>
  );
}

const PILL_LABELS: Record<keyof SummaryData["pills"], string> = {
  objectionHandled: "Objection Handled",
  prospectQualified: "Prospect Qualified",
  whiteLabelPitched: "White-Label Pitched",
  visitCloseMade: "Visit Close Made",
};

const RATING_COLOUR: Record<string, string> = {
  Excellent: "text-green-400",
  Good: "text-blue-400",
  "Needs Work": "text-yellow-400",
  Missed: "text-red-400",
};

export default function SessionSummary({
  summary,
  onPracticeAgain,
  onNewSession,
}: Props) {
  const pillKeys = Object.keys(summary.pills) as Array<keyof SummaryData["pills"]>;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-navy">
      {/* Header + score */}
      <div className="flex items-center gap-4">
        <ScoreRing score={summary.overallScore} />
        <div>
          <h2 className="text-xl font-bold text-gold">Session Complete</h2>
          <p className="text-sm text-gray-400 mt-1">
            Overall Performance Score
          </p>
        </div>
      </div>

      {/* Score pills */}
      <div className="flex flex-wrap gap-2">
        {pillKeys.map((k) => (
          <div
            key={k}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              summary.pills[k]
                ? "bg-green-500/20 border-green-500 text-green-300"
                : "bg-navy-surface border-navy-surface text-gray-500"
            }`}
          >
            {summary.pills[k] ? "✅" : "⚪️"} {PILL_LABELS[k]}
          </div>
        ))}
      </div>

      {/* Objection handling */}
      <div className="bg-navy-surface rounded-lg p-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Objection Rating
          </span>
          <span
            className={`text-sm font-bold ${
              RATING_COLOUR[summary.objectionRating] ?? "text-gray-300"
            }`}
          >
            {summary.objectionRating}
          </span>
        </div>
        <p className="text-sm text-gray-300">{summary.objectionNotes}</p>
      </div>

      {/* Top 3 done well */}
      <div className="space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-400">
          Top 3 — Done Well
        </h3>
        {summary.topThingsDoneWell.map((item, i) => (
          <div
            key={i}
            className="flex gap-2 text-sm text-gray-200 bg-green-500/10 border border-green-500/20 rounded px-3 py-2"
          >
            <span className="text-green-400 font-bold flex-shrink-0">
              {i + 1}.
            </span>
            {item}
          </div>
        ))}
      </div>

      {/* Top 3 to improve */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-gray-400">
          Top 3 — Improve (with exact scripts)
        </h3>
        {summary.topThingsToImprove.map((item, i) => (
          <div
            key={i}
            className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 space-y-1"
          >
            <div className="flex gap-2 text-sm text-gray-200">
              <span className="text-red-400 font-bold flex-shrink-0">{i + 1}.</span>
              {item.issue}
            </div>
            <div className="text-xs text-gold bg-gold/10 rounded px-2 py-1 border border-gold/30">
              💬 Say instead: &ldquo;{item.script}&rdquo;
            </div>
          </div>
        ))}
      </div>

      {/* Recommended next session */}
      <div className="bg-navy-surface rounded-lg p-3 space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-400">
          Recommended Next Session
        </h3>
        <p className="text-sm text-gray-200">{summary.recommendedNextSession}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onPracticeAgain}
          className="flex-1 py-3 rounded bg-navy-surface border border-navy-surface text-gray-200 text-sm font-semibold hover:border-gold hover:text-gold transition"
        >
          🔁 Practice Same Scenario
        </button>
        <button
          onClick={onNewSession}
          className="flex-1 py-3 rounded bg-gold text-navy text-sm font-semibold hover:bg-gold/90 transition"
        >
          ✨ New Session
        </button>
      </div>
    </div>
  );
}
