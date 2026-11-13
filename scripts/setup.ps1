# ==============================================================================
# TeleMind Monorepo Setup Script (Windows PowerShell)
# ==============================================================================

Write-Host "🚀 Initializing TeleMind project environment..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "📋 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️ Please update .env with your credentials (e.g. GEMINI_API_KEY, TELEGRAM_BOT_TOKEN)." -ForegroundColor Yellow
} else {
    Write-Host "ℹ️ .env already exists. Skipping copy." -ForegroundColor Gray
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ pnpm not found. Please install pnpm (>=9.0.0): npm install -g pnpm" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing workspace dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "🗄️ Starting local infrastructure containers (PostgreSQL + Redis)..." -ForegroundColor Cyan
docker compose up -d postgres redis

Write-Host "✅ Environment setup complete! Run 'pnpm dev' to launch development servers." -ForegroundColor Green
