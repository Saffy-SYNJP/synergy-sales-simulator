#!/bin/bash
echo "=== Fresh deploy on sarfarazmd409 ==="
cd ~/Desktop/_Archive/Coding/Simulator

# Step 1: Remove old link to saffymd88
echo ">> Removing old Vercel link..."
rm -rf .vercel

# Step 2: Confirm we're logged in as sarfarazmd409
echo ">> Current Vercel account:"
vercel whoami

# Step 3: Link to existing sarfarazmd409 project
echo ""
echo "==========================================="
echo "  When prompted:"
echo "    Set up and deploy? Y"
echo "    Which scope? sarfarazmd409"
echo "    Link to existing project? YES"
echo "    Project name: synergy-sales-trainer"
echo "==========================================="
echo ""
vercel link

# Step 4: Deploy to production
echo ""
echo ">> Deploying to production..."
vercel --prod

echo ""
echo "=== ✅ DONE ==="
