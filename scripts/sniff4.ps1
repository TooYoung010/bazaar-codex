$indexHtml = (Invoke-WebRequest -Uri 'https://www.howbazaar.gg/' -UseBasicParsing -TimeoutSec 10).Content
$jsFiles = [regex]::Matches($indexHtml, '/_app/[^"]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique

foreach ($f in $jsFiles) {
    $url = "https://www.howbazaar.gg$f"
    try {
        $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content
    } catch { continue }

    # Find m0 = ... assignment
    foreach ($kw in @('m0=', 'm0 =', 'imageVersions', 'IMAGE_VERSIONS')) {
        $idx = $c.IndexOf($kw)
        if ($idx -ge 0) {
            $start = [Math]::Max(0, $idx - 30)
            $len = [Math]::Min($c.Length - $start, 600)
            Write-Host "[$f][$kw@$idx]"
            Write-Host $c.Substring($start, $len)
            Write-Host ""
        }
    }
}

Write-Host "=== Find variable just before 'images/${t}/${e}.avif' ==="
foreach ($f in $jsFiles) {
    $url = "https://www.howbazaar.gg$f"
    try {
        $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content
    } catch { continue }
    $idx = $c.IndexOf('images/${t}/${e}.avif')
    if ($idx -ge 0) {
        $start = [Math]::Max(0, $idx - 400)
        $len = [Math]::Min($c.Length - $start, 600)
        Write-Host "[$f] ctx:"
        Write-Host $c.Substring($start, $len)
    }
}
