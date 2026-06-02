$j = Get-Content (Join-Path $PSScriptRoot '..\data\raw\bpp_card_dict.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$names = $j.PSObject.Properties.Name

# Check field structure across multiple entries
Write-Host "=== Sample 5 entries ==="
$names | Select-Object -First 5 | ForEach-Object {
    $e = $j.$_
    Write-Host "[$_]"
    $e.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name) = $($_.Value | ConvertTo-Json -Compress -Depth 3)"
    }
}

# Count how many of our 926 items have a translation
$itemsRaw = (Get-Content (Join-Path $PSScriptRoot '..\data\raw\items.json') -Raw | ConvertFrom-Json).data
$matched = 0; $unmatched = @()
foreach ($it in $itemsRaw) {
    if ($j.PSObject.Properties.Name -contains $it.id) {
        $matched++
    } else {
        $unmatched += $it.name
    }
}
Write-Host ""
Write-Host "=== Coverage check ==="
Write-Host "Matched: $matched / $($itemsRaw.Count)"
Write-Host "Unmatched samples (first 15):"
$unmatched | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }

# Try fetching extra files
Write-Host ""
Write-Host "=== Probe other static endpoints ==="
$probes = @(
    'https://bpp-static.bazaarplusplus.com/text_dict.json',
    'https://bpp-static.bazaarplusplus.com/tooltip_dict.json',
    'https://bpp-static.bazaarplusplus.com/i18n_zh.json',
    'https://bpp-static.bazaarplusplus.com/locales/zh-CN.json',
    'https://bpp-static.bazaarplusplus.com/translations.json',
    'https://bpp-static.bazaarplusplus.com/skills_dict.json',
    'https://bpp-static.bazaarplusplus.com/heroes_dict.json',
    'https://bpp-static.bazaarplusplus.com/builds.json',
    'https://bpp-static.bazaarplusplus.com/decks.json'
)
foreach ($u in $probes) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
        Write-Host "[$($r.StatusCode)] Len=$($r.Content.Length)  $u"
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
