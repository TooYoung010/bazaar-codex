$ErrorActionPreference = 'Continue'
# Validate naming rule against many items
$items = (Get-Content (Join-Path $PSScriptRoot '..\data\raw\items.json') -Raw | ConvertFrom-Json).data

# Test 30 random items with multiple name encodings
$cdn = 'https://howbazaar-images.b-cdn.net'
$sample = $items | Get-Random -Count 30

$rules = @{
    'NoSpaces' = { param($n) $n -replace '\s','' }
    'Underscore' = { param($n) $n -replace '\s','_' }
    'Hyphen' = { param($n) $n -replace '\s','-' }
    'Raw' = { param($n) $n }
    'NoSpacesNoApos' = { param($n) ($n -replace '\s','') -replace "['']" }
}

$results = @{}
foreach ($k in $rules.Keys) { $results[$k] = @{ ok = 0; fail = 0 } }

foreach ($it in $sample) {
    foreach ($k in $rules.Keys) {
        $name = & $rules[$k] $it.name
        $u = "$cdn/images/items/$name.avif"
        try {
            $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 4 -ErrorAction Stop
            if ($r.StatusCode -eq 200) { $results[$k].ok++ }
        } catch {
            $results[$k].fail++
        }
    }
}

Write-Host "Results across 30 items:"
foreach ($k in $rules.Keys) {
    Write-Host "  $k : OK=$($results[$k].ok)  FAIL=$($results[$k].fail)"
}

# Show items where "NoSpaces" failed - might have special chars
Write-Host ""
Write-Host "=== Items that failed under NoSpaces rule ==="
foreach ($it in $sample) {
    $name = ($it.name -replace '\s','')
    $u = "$cdn/images/items/$name.avif"
    try {
        $null = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 4 -ErrorAction Stop
    } catch {
        Write-Host "  FAIL: '$($it.name)' -> '$name'"
    }
}
