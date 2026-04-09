#!/bin/bash
echo "=== Adding Environment Variables to Vercel ==="
cd ~/Desktop/_Archive/Coding/Simulator

# Add ANTHROPIC_API_KEY from .env.local
VALUE=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d'=' -f2-)
printf "%s" "$VALUE" | vercel env add ANTHROPIC_API_KEY production preview development --yes
echo ">> ✅ ANTHROPIC_API_KEY added"

# Add NEXT_PUBLIC_VOICE_ENABLED = false (override local value)
printf "false" | vercel env add NEXT_PUBLIC_VOICE_ENABLED production preview development --yes
echo ">> ✅ NEXT_PUBLIC_VOICE_ENABLED set to false"

# Add ElevenLabs API key from .env.local comment
ELKEY=$(grep '^ELEVENLABS_API_KEY=' .env.local | cut -d'=' -f2-)
printf "%s" "$ELKEY" | vercel env add ELEVENLABS_API_KEY production preview development --yes
echo ">> ✅ ELEVENLABS_API_KEY added"

# Add voice IDs
printf "wNl2YBRc8v5uIcq6gOxd" | vercel env add ELEVENLABS_VOICE_PHILIPPINES production preview development --yes
echo ">> ✅ ELEVENLABS_VOICE_PHILIPPINES added"

printf "z9AwTVuN8C7iJ75jitEW" | vercel env add ELEVENLABS_VOICE_VIETNAM production preview development --yes
echo ">> ✅ ELEVENLABS_VOICE_VIETNAM added"

printf "wJ5MX7uuKXZwFqGdWM4N" | vercel env add ELEVENLABS_VOICE_INDIA production preview development --yes
echo ">> ✅ ELEVENLABS_VOICE_INDIA added"

# Empty placeholders
printf " " | vercel env add ELEVENLABS_VOICE_AI_REP production preview development --yes
echo ">> ✅ ELEVENLABS_VOICE_AI_REP added (empty)"

printf " " | vercel env add ELEVENLABS_VOICE_COACH production preview development --yes
echo ">> ✅ ELEVENLABS_VOICE_COACH added (empty)"

printf " " | vercel env add DEEPGRAM_API_KEY production preview development --yes
echo ">> ✅ DEEPGRAM_API_KEY added (empty)"

echo ""
echo "=== All env vars added. Redeploying to production... ==="
vercel --prod

echo ""
echo "=== ✅ DONE! App should now work with API keys. ==="
