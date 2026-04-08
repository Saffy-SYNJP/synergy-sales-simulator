export interface ScoreState {
  objectionHandled: boolean;
  prospectQualified: boolean;
  whiteLabelPitched: boolean;
  visitCloseMade: boolean;
}

export const EMPTY_SCORE: ScoreState = {
  objectionHandled: false,
  prospectQualified: false,
  whiteLabelPitched: false,
  visitCloseMade: false,
};

const OBJECTION_KEYWORDS = /\b(castrol|shell|quality|spec|grade|certified|same standard|api)\b/i;
const QUALIFY_KEYWORDS = /\b(volume|how many|litre|liter|monthly|decision|who makes|timeline)\b/i;
const WHITELABEL_KEYWORDS = /\b(white[- ]?label|your brand|own brand|ecocrew|hana|python|custom label)\b/i;
const VISIT_KEYWORDS = /\b(visit|come to|in person|sample|meet|personally|fly over)\b/i;

export function updateScore(prev: ScoreState, userMessage: string): ScoreState {
  const text = userMessage.toLowerCase();
  return {
    objectionHandled: prev.objectionHandled || OBJECTION_KEYWORDS.test(text),
    prospectQualified: prev.prospectQualified || QUALIFY_KEYWORDS.test(text),
    whiteLabelPitched: prev.whiteLabelPitched || WHITELABEL_KEYWORDS.test(text),
    visitCloseMade: prev.visitCloseMade || VISIT_KEYWORDS.test(text),
  };
}
