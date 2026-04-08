#!/bin/bash
set -e
echo "=== Synergy Sales Trainer — Vercel Deployment ==="
echo ""

cd ~/Desktop/_Archive/Coding/Simulator
rm -f .git/index.lock 2>/dev/null

# Git setup
if [ ! -d ".git" ] || [ -z "$(git log --oneline 2>/dev/null | head -1)" ]; then
  echo ">> Initializing git repo..."
  [ ! -d ".git" ] && git init
  git add .
  git commit -m "Initial commit — Synergy Sales Training Engine"
  echo ">> ✅ Git repo initialized and committed."
else
  echo ">> ✅ Git repo already has commits."
  git add .
  git diff --cached --quiet || git commit -m "Pre-deployment update"
fi

# Build
echo ""
echo ">> Running production build..."
npm run build
echo ">> ✅ Build passed!"

# Vercel CLI
echo ""
if ! command -v vercel &> /dev/null; then
  echo ">> Installing Vercel CLI..."
  npm install -g vercel
fi
echo ">> Vercel CLI version: $(vercel --version)"

# Login check
echo ""
echo ">> Checking Vercel login..."
vercel whoami 2>/dev/null || {
  echo ">> You need to log in first. Running vercel login..."
  vercel login
}

# Deploy
echo ""
echo "==========================================="
echo "  DEPLOYING TO VERCEL"
echo "  When prompted:"
echo "    Set up and deploy? Y"
echo "    Which scope? Select your account"
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
echo "=== ✅ DEPLOYMENT COMPLETE ==="
echo "=== Copy the production URL above ==="
echo "=== Then add env vars in Vercel dashboard ==="
