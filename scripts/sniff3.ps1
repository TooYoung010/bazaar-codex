$indexHtml = (Invoke-WebRequest -Uri 'https://www.howbazaar.gg/' -UseBasicParsing -TimeoutSec 10).Content
$jsFiles = [regex]::Matches($indexHtml, '/_app/[^"]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique

# Sniff each JS bundle for image URL construction context
foreach ($f in $jsFiles) {
    $url = "https://www.howbazaar.gg$f"
    try {
        $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content
    } catch { continue }
    # Search for keyword
    foreach ($kw in @('thumbnail-', 'b-cdn', '/images/', '.avif')) {
        $idx = $c.IndexOf($kw)
        while ($idx -ge 0) {
            $start = [Math]::Max(0, $idx - 80)
            $len = [Math]::Min($c.Length - $start, 200)
            $snippet = $c.Substring($start, $len)
            Write-Host "[$f][$kw@$idx] $snippet"
            Write-Host ""
            $idx = $c.IndexOf($kw, $idx + 1)
            if ($idx -gt 5000000) { break }  # safety
        }
    }
}
