$ErrorActionPreference = 'Continue'
# Find image URLs in howbazaar.gg HTML
$r = Invoke-WebRequest -Uri 'https://www.howbazaar.gg/' -UseBasicParsing -TimeoutSec 15
$pattern = 'https?://[^"\s]+\.(?:png|webp|jpg|jpeg)'
$found = [regex]::Matches($r.Content, $pattern) | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Found $($found.Count) image URLs from homepage:"
$found | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Try /items page ==="
$r2 = Invoke-WebRequest -Uri 'https://www.howbazaar.gg/items' -UseBasicParsing -TimeoutSec 15
$found2 = [regex]::Matches($r2.Content, $pattern) | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Found $($found2.Count) image URLs:"
$found2 | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Look for any /assets/ /images/ paths in HTML ==="
$pat2 = '(?:src|srcSet|href)="[^"]*?(?:image|asset|item)[^"]*?"'
$found3 = [regex]::Matches($r2.Content, $pat2) | ForEach-Object { $_.Value } | Sort-Object -Unique
$found3 | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }
