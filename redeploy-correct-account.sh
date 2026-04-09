#!/bin/bash
echo "=== Redeploying under sarfarazmd409 account ==="
cd ~/Desktop/_Archive/Coding/Simulator

# Remove existing Vercel link (which points to saffymd88-4095)
rm -rf .vercel

# Switch account
echo ">> Logging out of current Vercel account..."
vercel logout --yes 2>/dev/null
echo ">> Logging in — select sarfarazmd409@gmail.com..."
vercel login

echo ""
echo "==========================================="
echo "  DEPLOYING TO VERCEL (sarfarazmd409)"
echo "  When prompted:"
echo "    Set up and deploy? Y"
echo "    Which scope? sarfarazmd409"
echo "    Link to existing project? N"
echo "    Project name: synergy-sales-trainer"
echo "    Directory: ./"
echo "    Override settings? N"
echo "==========================================="
echo ""
vercel

echo ""
echo ">> Deploying to PRODUCTION..."
vercel --prod

echo ""
echo ">> Now adding environment variables..."

# Add ANTHROPIC_API_KEY from .env.local
VALUE=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d'=' -f2-)
printf "%s" "$VALUE" | vercel env add ANTHROPIC_API_KEY production preview development --yes
echo ">> ✅ ANTHROPIC_API_KEY"

printf "false" | vercel env add NEXT_PUBLIC_VOICE_ENABLED production preview development --yes
echo ">> ✅ NEXT_PUBLIC_VOICE_ENABLED = false"

ELKEY=$(grep '^ELEVENLABS_API_KEY=' .env.local | cut -d'=' -f2-)
printf "%s" "$ELKEY" | vercel env add ELEVENLABS_API_KEY production preview development --yes
echo ">> ✅ ELEVENLABS_API_KEY"

printf "wNl2YBRc8v5uIcq6gOxd" | vercel env add ELEVENLABS_VOICE_PHILIPPINES production preview development --yes
printf "z9AwTVuN8C7iJ75jitEW" | vercel env add ELEVENLABS_VOICE_VIETNAM production preview development --yes
printf "wJ5MX7uuKXZwFqGdWM4N" | vercel env add ELEVENLABS_VOICE_INDIA production preview development --yes
printf " " | vercel env add ELEVENLABS_VOICE_AI_REP production preview development --yes
printf " " | vercel env add ELEVENLABS_VOICE_COACH production preview development --yes
printf " " | vercel env add DEEPGRAM_API_KEY production preview development --yes
echo ">> ✅ All voice variables added"

echo ""
echo ">> Final production redeploy with env vars..."
vercel --prod

echo ""
echo "=== ✅ DONE — synergy-sales-trainer.vercel.app ==="
