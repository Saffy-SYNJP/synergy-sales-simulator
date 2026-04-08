# Synergy Sales Training Engine

Bilingual B2B sales training simulator for **Synergy Lubricant & Chemical Co., Ltd.** sales freelancers.

Practice selling EcoMatic lubricants and white-label services to bilingual prospects in Philippines, Vietnam, Myanmar, and Cambodia — using a Hormozi-style sales framework with live AI coaching.

## Modes

| Mode | You play | AI plays | Goal |
|------|----------|----------|------|
| 🎯 **Prospect Simulator** | Salesperson | Bilingual prospect | Close the deal |
| 👁 **Watch AI Sell** | Difficult prospect | Perfect AI rep | Learn perfect responses |
| 🧠 **Coach Mode** | Yourself | Hormozi sales coach | Get scored + word-for-word scripts |

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** (dark navy theme)
- **Anthropic Claude** via `@ai-sdk/anthropic` + `streamText` (server-side Edge runtime)
- **Vercel AI SDK** `useChat` for real-time streaming
- **Deepgram Nova-2** — streaming STT via WebSocket (Phase 2)
- **ElevenLabs eleven_flash_v2_5** — streaming TTS (Phase 2)
- **Web Speech API** — STT fallback (Phase 2)

---

## Local Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Add your Anthropic API key to .env.local
#    Get one at: https://console.anthropic.com/settings/keys

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Always | Claude API key — all AI calls route through server-side `/api/chat` |
| `ANTHROPIC_MODEL` | ❌ Optional | Override default model (default: `claude-sonnet-4-6`) |
| `NEXT_PUBLIC_VOICE_ENABLED` | ❌ Optional | Set `true` to activate Phase 2 voice features (default: `false`) |
| `DEEPGRAM_API_KEY` | Phase 2 only | STT — Deepgram Nova-2 streaming |
| `ELEVENLABS_API_KEY` | Phase 2 only | TTS — ElevenLabs streaming proxy |
| `ELEVENLABS_VOICE_PHILIPPINES` | Phase 2 only | ElevenLabs Voice ID for Rico Mendoza (Philippines) |
| `ELEVENLABS_VOICE_VIETNAM` | Phase 2 only | ElevenLabs Voice ID for Nguyễn Văn Thành (Vietnam) |
| `ELEVENLABS_VOICE_MYANMAR` | Phase 2 only | ElevenLabs Voice ID for Ko Zaw Win (Myanmar) |
| `ELEVENLABS_VOICE_CAMBODIA` | Phase 2 only | ElevenLabs Voice ID for Sopheak Lim (Cambodia) |
| `ELEVENLABS_VOICE_AI_REP` | Phase 2 only | ElevenLabs Voice ID for Watch AI Sell mode |
| `ELEVENLABS_VOICE_COACH` | Phase 2 only | ElevenLabs Voice ID for Coach Mode |

> **Security:** `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` are **server-side only** — never exposed to the browser. All AI calls proxy through `/api/chat`, `/api/tts`, and `/api/stt`.

---

## How to Enable Voice (Phase 2)

1. Sign up for [Deepgram](https://console.deepgram.com) and [ElevenLabs](https://elevenlabs.io)
2. Choose a voice per persona in the ElevenLabs Voice Library and copy the Voice IDs
3. Add all keys to `.env.local`
4. Set `NEXT_PUBLIC_VOICE_ENABLED=true` in `.env.local`
5. Restart `npm run dev`

Voice features when enabled:
- Microphone button replaces the Send button
- Hold-to-talk or toggle mode
- Real-time Deepgram streaming STT (auto-sends after 1.5 s silence)
- ElevenLabs streams AI voice back with low latency
- User speech interrupts AI playback mid-sentence
- Per-market voice personas

---

## Deployment to Vercel

### First deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Or link to an existing project
vercel link
vercel deploy --prod
```

### Set environment variables on Vercel

Go to **Vercel Dashboard → Project → Settings → Environment Variables** and add:

- `ANTHROPIC_API_KEY` — required
- `NEXT_PUBLIC_VOICE_ENABLED` — set to `false` until voice keys are ready
- All Phase 2 keys when ready

Or use the CLI:

```bash
vercel env add ANTHROPIC_API_KEY production
```

### Build check (local)

```bash
npm run build
```

The build must pass with zero errors before deploying.

---

## Project Architecture

```
app/
  api/
    chat/route.ts         # Claude streaming (Edge) — all 3 modes
    summary/route.ts      # Post-session coaching summary (Edge)
    tts/route.ts          # ElevenLabs TTS proxy (Edge) [Phase 2]
    stt/route.ts          # Deepgram STT — audio blob → transcript [Phase 2]
    stt/token/route.ts    # Deepgram WebSocket token issuer [Phase 2]
  page.tsx                # Setup sidebar + chat layout
  layout.tsx
  globals.css

components/
  ChatPanel.tsx           # Main chat UI — useChat + voice + session summary
  SessionSummary.tsx      # Post-session coaching report screen
  ModeSelector.tsx        # 3 mode tabs
  MarketSelector.tsx      # 4 market cards
  ObjectionPicker.tsx     # 20 objections × 6 categories + random mix
  MessageBubble.tsx       # Bilingual rendering + TIP highlight
  ScoreTracker.tsx        # 4 live score pills
  QuickActions.tsx        # Mode-specific quick-fire buttons
  VoiceStatusBar.tsx      # Listening/Processing/Speaking bar [Phase 2]
  VoiceControls.tsx       # Mic button + level meter + mute [Phase 2]

hooks/
  useVoiceInput.ts        # Deepgram WS + Web Speech API fallback [Phase 2]
  useVoicePlayback.ts     # ElevenLabs audio playback [Phase 2]
  useVoice.ts             # Unified voice hook [Phase 2]

lib/
  markets.ts              # 4 market personas with bilingual style guides
  objections.ts           # 20 objections × 6 categories
  prompts.ts              # System prompt builders (prospect/demo/coach/summary)
  synergy.ts              # Synergy product brief + Hormozi framework
  scoring.ts              # Live keyword detection for 4 score pills
  voices.ts               # ElevenLabs voice settings [Phase 2]
  voiceConfig.ts          # Voice + STT configuration constants [Phase 2]
```
