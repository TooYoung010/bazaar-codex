$ErrorActionPreference = 'Continue'
# Fetch a real item detail page and extract image url
$url = 'https://www.howbazaar.gg/items/28-hour-fitness'
$urls2 = @(
    'https://www.howbazaar.gg/items/28%20Hour%20Fitness'
    'https://www.howbazaar.gg/item/28%20Hour%20Fitness'
    'https://www.howbazaar.gg/item/28-hour-fitness'
    'https://www.howbazaar.gg/items/28-hour-fitness'
)
foreach ($u in $urls2) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop
        Write-Host "OK [$($r.StatusCode)] $u  Len=$($r.Content.Length)"
        # Search for any cdn/image URL or 28%20Hour or .avif in HTML
        $hits = [regex]::Matches($r.Content, '(?:src|data-src|href|content)=(?:"|'')([^"'']*?(?:b-cdn|bunnycdn|\.avif|\.png|\.webp)[^"'']*?)(?:"|'')') |
                ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        Write-Host "  Image hits ($($hits.Count)):"
        $hits | Select-Object -First 15 | ForEach-Object { Write-Host "    $_" }
        # Look for hardcoded paths
        $hits2 = [regex]::Matches($r.Content, '/images?/[a-zA-Z0-9_\-/%\.]+') | ForEach-Object { $_.Value } | Sort-Object -Unique
        Write-Host "  Path hits:"
        $hits2 | Select-Object -First 10 | ForEach-Object { Write-Host "    $_" }
        break
    } catch {
        Write-Host "[ERR] $u  $($_.Exception.Message)"
    }
}
