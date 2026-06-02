$ErrorActionPreference = 'Continue'
# Sniff bazaarplusplus js bundle for tooltip translations
$jsUrl = 'https://bazaarplusplus.com/assets/index-BAl1QY7D.js'
$c = (Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 30).Content
Write-Host "JS size: $($c.Length)"

# Search for keywords that suggest text translation
foreach ($kw in @('tooltip', 'TooltipDict', 'desc_dict', 'effect_dict', 'text_dict', 'phrase_dict', 'tip_dict', 'desc:', 'description:', '冷却', '伤害', '护盾', '描述', 'Cooldown')) {
    $idx = $c.IndexOf($kw)
    if ($idx -ge 0) {
        Write-Host "FOUND '$kw' @ $idx"
    }
}

Write-Host ""
Write-Host "=== fetch / json URLs ==="
$urls = [regex]::Matches($c, 'https?://[^"`'']+\.json') | ForEach-Object { $_.Value } | Sort-Object -Unique
$urls | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== fetch refs to bpp-static ==="
$urls2 = [regex]::Matches($c, '[''""][^''""\s]*bpp-static[^''""\s]*[''""]') | ForEach-Object { $_.Value } | Sort-Object -Unique
$urls2 | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Possible static asset paths (first 30) ==="
$urls3 = [regex]::Matches($c, '/[a-z][a-z0-9_\-/]+\.(?:json|txt|csv)') | ForEach-Object { $_.Value } | Sort-Object -Unique
$urls3 | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Look for any chinese text strings (tooltip-like) ==="
# Find Chinese sentences inside the bundle
$cn = [regex]::Matches($c, '"[\u4e00-\u9fff][\u4e00-\u9fff\s\u3000-\u303f\uff00-\uffef0-9a-zA-Z]{4,40}"') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Chinese phrases count: $($cn.Count)"
$cn | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }
