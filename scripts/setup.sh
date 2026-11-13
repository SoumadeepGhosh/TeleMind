#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# TeleMind Monorepo Setup Script (Linux/macOS)
# ==============================================================================

echo "🚀 Initializing TeleMind project environment..."

if [ ! -f .env ]; then
  echo "📋 Copying .env.example to .env..."
  cp .env.example .env
  echo "⚠️ Please update .env with your credentials (e.g. GEMINI_API_KEY, TELEGRAM_BOT_TOKEN)."
else
  echo "ℹ️ .env already exists. Skipping copy."
fi

echo "📦 Checking package manager..."
if ! command -v pnpm &> /dev/null; then
  echo "⚠️ pnpm not found. Please install pnpm (>=9.0.0): npm install -g pnpm"
  exit 1
fi

echo "📦 Installing workspace dependencies..."
pnpm install

echo "🗄️ Starting local infrastructure containers (PostgreSQL + Redis)..."
docker compose up -d postgres redis

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec telemind-postgres pg_isready -U telemind_admin -d telemind > /dev/null 2>&1; do
  sleep 1
done

echo "✅ Environment initialized successfully!"
echo "Run 'pnpm dev' to start applications in development mode."
