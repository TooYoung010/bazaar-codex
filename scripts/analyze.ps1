# Analyze JSON structure of items.json and skills.json
$itemsPath = Join-Path $PSScriptRoot '..\data\raw\items.json'
$json = Get-Content $itemsPath -Raw | ConvertFrom-Json
Write-Host "=== items.json ==="
Write-Host "Total items: $($json.data.Count)"
Write-Host "Version: $($json.version)"
Write-Host ""
Write-Host "First item keys:"
$first = $json.data[0]
$first.PSObject.Properties.Name | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "First item full JSON:"
$first | ConvertTo-Json -Depth 8

Write-Host ""
Write-Host "=== Heroes distribution ==="
$json.data | Group-Object -Property { ($_.heroes -join ',') } | Sort-Object Count -Descending | Select-Object Count, Name | Format-Table -AutoSize

Write-Host ""
Write-Host "=== Sample item with rich data (find one with many fields) ==="
$rich = $json.data | Where-Object { $_.unifiedTooltips -or $_.tags } | Select-Object -First 1
$rich | ConvertTo-Json -Depth 8
