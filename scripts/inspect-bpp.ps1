$j = Get-Content (Join-Path $PSScriptRoot '..\data\raw\bpp_card_dict.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "Top type: $($j.GetType().Name)"

# If it's a hashtable / object
if ($j -is [System.Management.Automation.PSCustomObject]) {
    $names = $j.PSObject.Properties.Name
    Write-Host "Top-level keys count: $($names.Count)"
    Write-Host "First 5 keys:"
    $names | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" }

    Write-Host ""
    Write-Host "First entry full:"
    $first = $j.($names[0])
    $first | ConvertTo-Json -Depth 5
} elseif ($j -is [System.Array]) {
    Write-Host "Array with $($j.Count) items"
    Write-Host "First item:"
    $j[0] | ConvertTo-Json -Depth 5
}
