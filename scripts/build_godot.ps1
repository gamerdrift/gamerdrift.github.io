# RogueGhost Automated Godot Web Exporter & Site Compiler Pipeline

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛸 STARTING ROGUEGHOST PIPELINE EXPORT..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Validation Check
Write-Host "🔍 [STEP 1] Validating GDScripts Headless..." -ForegroundColor Yellow
$checkCmd = & "./Godot_v4.6.3-stable_win64_console.exe" --path ./rogue_ghost/ --headless --check-only
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation validation failed! Please check your GDScript syntax." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Validation successful." -ForegroundColor Green

# Step 2: Web Assembly Export
Write-Host "📦 [STEP 2] Compiling and exporting Godot to Web/HTML5..." -ForegroundColor Yellow
$exportCmd = & "./Godot_v4.6.3-stable_win64_console.exe" --path ./rogue_ghost/ --headless --export-release "Web"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web export failed! Please verify export presets in Godot." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Godot Web export generated inside public/games/rogueghost/" -ForegroundColor Green

# Step 3: Next.js Compile
Write-Host "🛰️ [STEP 3] Running Next.js compilation..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Next.js site build failed! Check logs." -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🎉 PIPELINE COMPLETE! Game is fully live in local /out/." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
