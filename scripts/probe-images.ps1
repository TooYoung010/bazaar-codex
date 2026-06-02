# Probe potential image / asset endpoints + check item field for image url
$ErrorActionPreference = 'Continue'

# 1. Re-inspect items.json for any image / artwork field
$itemsPath = Join-Path $PSScriptRoot '..\data\raw\items.json'
$items = (Get-Content $itemsPath -Raw | ConvertFrom-Json).data

Write-Host "=== Inspect first 3 items: all fields ==="
$items[0..2] | ForEach-Object {
    Write-Host "----- $($_.name) -----"
    $_.PSObject.Properties | ForEach-Object {
        $v = if ($_.Value -is [string]) { $_.Value } else { ($_.Value | ConvertTo-Json -Compress -Depth 2) }
        if ($v.Length -gt 120) { $v = $v.Substring(0, 120) + '...' }
        Write-Host "  $($_.Name) = $v"
    }
}

Write-Host ""
Write-Host "=== Probe possible image hosts ==="
$sample = $items[0]
$slug = ($sample.name -replace "[^a-zA-Z0-9]", "_").ToLower()
$nameEnc = [System.Web.HttpUtility]::UrlEncode($sample.name)
$id = $sample.id
$urls = @(
    "https://www.howbazaar.gg/images/items/$id.png"
    "https://www.howbazaar.gg/images/items/$id.webp"
    "https://www.howbazaar.gg/items/$id.png"
    "https://www.howbazaar.gg/api/images/items/$id"
    "https://cdn.howbazaar.gg/items/$id.png"
    "https://www.howbazaar.gg/_next/image?url=%2Fitems%2F$id.png&w=128&q=75"
    "https://www.howbazaar.gg/items/$($sample.name -replace ' ','_').png"
    "https://www.howbazaar.gg/static/items/$id.png"
    "https://www.howbazaar.gg/assets/items/$id.png"
)
Add-Type -AssemblyName System.Web
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[$($r.StatusCode)] $u"
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
