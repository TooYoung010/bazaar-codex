$ErrorActionPreference = 'Continue'
$r = Invoke-WebRequest -Uri 'https://www.howbazaar.gg/' -UseBasicParsing -TimeoutSec 10
# Grab JS/CSS file URLs
$pat = '/_app/[^"]+\.(?:js|css)'
$assets = [regex]::Matches($r.Content, $pat) | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "App assets:"
$assets | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }

# Look for any image-related patterns in homepage
$imgPats = @(
    'avif',
    'b-cdn',
    'image',
    'thumbnail'
)
foreach ($p in $imgPats) {
    $hits = [regex]::Matches($r.Content, "[^\s""']*$p[^\s""']*") | ForEach-Object { $_.Value } | Sort-Object -Unique
    Write-Host ""
    Write-Host "Pattern '$p' hits ($($hits.Count)):"
    $hits | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
}

# Try the JS bundle for image url construction
if ($assets.Count -gt 0) {
    Write-Host ""
    Write-Host "=== Sniff first JS bundle for image URL pattern ==="
    $js = $assets | Where-Object { $_ -like '*.js' } | Select-Object -First 3
    foreach ($j in $js) {
        $jsUrl = "https://www.howbazaar.gg$j"
        try {
            $jr = Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 10
            $cdnHits = [regex]::Matches($jr.Content, 'b-cdn\.net[^"`'']*') | ForEach-Object { $_.Value } | Sort-Object -Unique
            $imgHits = [regex]::Matches($jr.Content, '(?:items|images)/[^"`''\\]+\.(?:avif|png|webp)') | ForEach-Object { $_.Value } | Sort-Object -Unique
            Write-Host "  $j -> cdn hits=$($cdnHits.Count) img hits=$($imgHits.Count)"
            $cdnHits | Select-Object -First 8 | ForEach-Object { Write-Host "    CDN: $_" }
            $imgHits | Select-Object -First 8 | ForEach-Object { Write-Host "    IMG: $_" }
        } catch {
            Write-Host "  ERR $j  $($_.Exception.Message)"
        }
    }
}
