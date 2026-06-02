# Download and save all known JSON endpoints from howbazaar.gg
$ErrorActionPreference = 'Stop'
$outDir = Join-Path $PSScriptRoot '..\data\raw'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$endpoints = @{
    'items'      = 'https://www.howbazaar.gg/api/items'
    'skills'     = 'https://www.howbazaar.gg/api/skills'
    'monsters'   = 'https://www.howbazaar.gg/api/monsters'
    'encounters' = 'https://www.howbazaar.gg/api/encounters'
    'merchants'  = 'https://www.howbazaar.gg/api/merchants'
    'heroes'     = 'https://www.howbazaar.gg/api/heroes'
    'builds'     = 'https://www.howbazaar.gg/api/builds'
    'cards'      = 'https://www.howbazaar.gg/api/cards'
    'pools'      = 'https://www.howbazaar.gg/api/pools'
    'patches'    = 'https://www.howbazaar.gg/api/patches'
}

foreach ($name in $endpoints.Keys) {
    $url = $endpoints[$name]
    $out = Join-Path $outDir "$name.json"
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -OutFile $out
        $size = (Get-Item $out).Length
        Write-Host "OK  $name -> $out ($size bytes)"
    } catch {
        Write-Host "ERR $name | $($_.Exception.Message)"
    }
}
