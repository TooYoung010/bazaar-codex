$ErrorActionPreference = 'Continue'
# Sniff thebazaarzone main.js for data file references
$jsUrl = 'https://dotgg.gg/wp-content/plugins/dotgg-game/games/thebazaar/js/main.b442cda7ea3c47d81026.js'
try {
    $c = (Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 30).Content
    Write-Host "JS size: $($c.Length)"
} catch {
    Write-Host "ERR $($_.Exception.Message)"
    exit
}

# Find json data file refs
$jsons = [regex]::Matches($c, '[''""]([^''""\s]*\.json)[''""]') |
    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Write-Host "JSON refs found: $($jsons.Count)"
$jsons | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }

# Find karnok mentions
$idx = $c.IndexOf('Karnok')
if ($idx -ge 0) {
    Write-Host ""
    Write-Host "=== Karnok mentions in JS ==="
    $start = [Math]::Max(0, $idx - 80)
    $len = [Math]::Min($c.Length - $start, 300)
    Write-Host $c.Substring($start, $len)
}

# Look for fetch/import URLs
$urls = [regex]::Matches($c, 'https?://[^"`'']+') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host ""
Write-Host "=== HTTP URLs in JS (first 20) ==="
$urls | Where-Object { $_ -notlike '*googleapis*' -and $_ -notlike '*adthrive*' } | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
