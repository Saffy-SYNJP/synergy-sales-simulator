#!/bin/bash
echo "=== Adding env vars to saffymd88-4095 project ==="
cd ~/Desktop/_Archive/Coding/Simulator

VALUE=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d'=' -f2-)

echo ">> Adding ANTHROPIC_API_KEY to production..."
printf "%s" "$VALUE" | vercel env add ANTHROPIC_API_KEY production
echo ">> Adding ANTHROPIC_API_KEY to preview..."
printf "%s" "$VALUE" | vercel env add ANTHROPIC_API_KEY preview
echo ">> Adding ANTHROPIC_API_KEY to development..."
printf "%s" "$VALUE" | vercel env add ANTHROPIC_API_KEY development

echo ">> Adding NEXT_PUBLIC_VOICE_ENABLED to production..."
printf "false" | vercel env add NEXT_PUBLIC_VOICE_ENABLED production
echo ">> Adding NEXT_PUBLIC_VOICE_ENABLED to preview..."
printf "false" | vercel env add NEXT_PUBLIC_VOICE_ENABLED preview
echo ">> Adding NEXT_PUBLIC_VOICE_ENABLED to development..."
printf "false" | vercel env add NEXT_PUBLIC_VOICE_ENABLED development

echo ""
echo ">> Listing env vars:"
vercel env ls

echo ""
echo ">> Redeploying to production..."
vercel --prod

echo ""
echo "=== ✅ DONE ==="
