$ErrorActionPreference = 'Continue'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0'

$jsUrl = 'https://bazaarforge.gg/assets/index-DQPEq9r9.js'
$c = (Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 30 -UserAgent $ua).Content
Write-Host "JS size: $($c.Length)"

# Supabase URLs are like https://xxx.supabase.co
$supa = [regex]::Matches($c, 'https?://[a-z0-9]+\.supabase\.co[^"`'' )]*') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Supabase URLs: $($supa.Count)"
$supa | ForEach-Object { Write-Host "  $_" }

# Also look for SUPABASE_KEY / VITE_SUPABASE references
$keys = [regex]::Matches($c, '(?:SUPABASE|VITE_)[A-Z_]+["''` ]?\s*[:=]\s*["''`]([^"''`]+)["''`]') | ForEach-Object { $_.Value }
Write-Host ""
Write-Host "Env-like keys: $($keys.Count)"
$keys | Select-Object -First 10 | ForEach-Object { Write-Host "  $($_.Substring(0, [Math]::Min(80, $_.Length)))" }

# Look for table names referenced in supabase queries (common patterns: .from("xxx"), rpc('xxx'))
$tables = [regex]::Matches($c, '\.from\(["''`]([a-z_]+)["''`]\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Write-Host ""
Write-Host "Tables referenced via .from():"
$tables | ForEach-Object { Write-Host "  $_" }

$rpcs = [regex]::Matches($c, '\.rpc\(["''`]([a-z_]+)["''`]') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Write-Host ""
Write-Host "RPCs referenced:"
$rpcs | ForEach-Object { Write-Host "  $_" }

# JWT or anon key hints
$jwts = [regex]::Matches($c, 'eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host ""
Write-Host "JWT-like tokens: $($jwts.Count)"
$jwts | Select-Object -First 3 | ForEach-Object { Write-Host "  $($_.Substring(0, [Math]::Min(80, $_.Length)))..." }
