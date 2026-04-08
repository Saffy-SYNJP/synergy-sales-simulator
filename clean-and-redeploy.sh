#!/bin/bash
echo "=== STEP 1: Delete project from saffymd88 ==="
cd ~/Desktop/_Archive/Coding/Simulator

echo ">> Current account:"
vercel whoami

echo ""
echo ">> Deleting synergy-sales-trainer from saffymd88..."
vercel project rm synergy-sales-trainer --yes

echo ""
echo ">> Removing local .vercel link..."
rm -rf .vercel

echo ""
echo "=== STEP 2: Switch to sarfarazmd409 ==="
vercel logout --yes
echo ">> Logging in — select sarfarazmd409@gmail.com..."
vercel login

echo ""
echo "=== STEP 3: Deploy fresh ==="
echo "==========================================="
echo "  When prompted:"
echo "    Set up and deploy? Y"
echo "    Which scope? sarfarazmd409"
echo "    Link to existing project? YES"
echo "    Project name: synergy-sales-trainer"
echo "    Directory: ./"
echo "    Override settings? N"
echo "==========================================="
echo ""
vercel --prod

echo ""
echo "=== ✅ DONE ==="
echo ">> Final account check:"
vercel whoami
