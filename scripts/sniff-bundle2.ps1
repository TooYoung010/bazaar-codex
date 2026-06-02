$ErrorActionPreference = 'Continue'
# Download main JS bundle and look for image url construction
$indexHtml = (Invoke-WebRequest -Uri 'https://www.howbazaar.gg/' -UseBasicParsing -TimeoutSec 10).Content

# Find ALL js files referenced
$jsFiles = [regex]::Matches($indexHtml, '/_app/[^"]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Found $($jsFiles.Count) js files"

# Download all and grep
foreach ($f in $jsFiles) {
    $url = "https://www.howbazaar.gg$f"
    try {
        $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10).Content
        # Find image url construction
        $m1 = [regex]::Matches($c, "images/[^\\\\\\s\\.\"'`+]{2,40}/[^\\\\\\s\\.\"'`+]{2,40}\\.(?:avif|png|webp)")
        $m2 = [regex]::Matches($c, "thumbnail-\\$\\{[^}]+\\}-\\$\\{[^}]+\\}")
        $m3 = [regex]::Matches($c, "(?:items|cards|skills)/[^\\\\\\s\\.\"'`+]{2,60}\\.avif")
        if ($m1.Count + $m2.Count + $m3.Count -gt 0) {
            Write-Host "--- $f ---"
            $m1 | Select-Object -First 6 | ForEach-Object { Write-Host "  M1: $($_.Value)" }
            $m2 | Select-Object -First 6 | ForEach-Object { Write-Host "  M2: $($_.Value)" }
            $m3 | Select-Object -First 6 | ForEach-Object { Write-Host "  M3: $($_.Value)" }
        }
    } catch {}
}

# Now try to find data files
Write-Host ""
Write-Host "=== Look for data file refs in main bundle ==="
$entry = $jsFiles | Where-Object { $_ -like '*entry/start*' } | Select-Object -First 1
if ($entry) {
    $c = (Invoke-WebRequest -Uri "https://www.howbazaar.gg$entry" -UseBasicParsing).Content
    # Sniff the function that builds image url
    $idx = $c.IndexOf('thumbnail-')
    if ($idx -gt 0) {
        $start = [Math]::Max(0, $idx - 200)
        $len = [Math]::Min($c.Length - $start, 400)
        Write-Host "Context around 'thumbnail-':"
        Write-Host $c.Substring($start, $len)
    }
    $idx2 = $c.IndexOf('b-cdn')
    if ($idx2 -gt 0) {
        $start = [Math]::Max(0, $idx2 - 100)
        $len = [Math]::Min($c.Length - $start, 300)
        Write-Host ""
        Write-Host "Context around 'b-cdn':"
        Write-Host $c.Substring($start, $len)
    }
}
