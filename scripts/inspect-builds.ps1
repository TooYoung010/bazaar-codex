$ErrorActionPreference = 'Continue'

Write-Host "================ BB sample (1 article) ================"
$bb = Get-Content (Join-Path $PSScriptRoot '..\data\raw\bb_sample.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "Articles: $($bb.Count)"
$first = $bb[0]
Write-Host ""
Write-Host "Top-level keys:"
$first.PSObject.Properties.Name | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Title: $($first.title.rendered)"
Write-Host "Date: $($first.date)"
Write-Host "Slug: $($first.slug)"
Write-Host "Categories: $($first.categories -join ',')"
Write-Host "Excerpt:"
Write-Host $first.excerpt.rendered
Write-Host ""
Write-Host "Content head (first 1000 chars):"
$content = $first.content.rendered
Write-Host $content.Substring(0, [Math]::Min(1500, $content.Length))

Write-Host ""
Write-Host "================ MrMao sample ================"
$m = Get-Content (Join-Path $PSScriptRoot '..\data\raw\mrmao_sample.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "currentPage=$($m.currentPage) totalPages=$($m.totalPages) totalItems=$($m.totalItems)"
Write-Host "Sample item keys:"
$m.items[0].PSObject.Properties.Name | ForEach-Object { Write-Host "  $_" }
Write-Host "First 5 entries:"
$m.items | Select-Object -First 5 | ForEach-Object {
    $obj = $_
    $line = ($obj.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ' | '
    Write-Host "  $line"
}
