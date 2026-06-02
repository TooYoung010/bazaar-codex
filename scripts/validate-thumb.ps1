$ErrorActionPreference = 'Continue'
$items = (Get-Content (Join-Path $PSScriptRoot '..\data\raw\items.json') -Raw | ConvertFrom-Json).data

$cdn = 'https://howbazaar-images.b-cdn.net'
$sample = $items | Get-Random -Count 50

# Strip whitespace, hyphens, apostrophes (any quote-like char), commas, periods, etc.
function Clean-Name {
    param($s)
    # Remove anything that's not letter or digit
    return ($s -replace '[^A-Za-z0-9]','')
}

$ok = 0; $fail = @()
foreach ($it in $sample) {
    $heroName = $it.heroes[0]
    $itemName = Clean-Name $it.name
    $u = "$cdn/images/preview/thumbnail-$heroName-$itemName.avif"
    try {
        $null = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 4 -ErrorAction Stop
        $ok++
    } catch {
        $fail += "'$($it.name)' [$heroName] -> thumbnail-$heroName-$itemName.avif"
    }
}

Write-Host "OK=$ok / $($sample.Count)"
Write-Host ""
Write-Host "Failures:"
$fail | ForEach-Object { Write-Host "  $_" }
