$ErrorActionPreference = 'Continue'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36'

# Try mobalytics with browser UA
$urls = @(
    'https://mobalytics.gg/the-bazaar/builds',
    'https://app.mobalytics.gg/api/v1/the-bazaar/featured-builds',
    'https://app.mobalytics.gg/api/v1/the-bazaar/builds?game=the-bazaar',
    'https://app.mobalytics.gg/api/the-bazaar/builds',
    'https://api.mobalytics.gg/the-bazaar/v1/builds',
    'https://thebazaarzone.com/builds/',
    'https://thebazaar.fandom.com/api.php?action=query&list=recentchanges&format=json',
    # Forge
    'https://bazaarforge.gg/builds',
    'https://bazaarforge.gg/api/v1/builds',
    'https://api.bazaarforge.gg/v1/builds'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 10 -UserAgent $ua -ErrorAction Stop
        $isJson = $r.Headers['Content-Type'] -like '*json*'
        Write-Host "[$($r.StatusCode)] $(if($isJson){'JSON'}else{'html'}) Len=$($r.Content.Length)  $u"
        if ($isJson) {
            Write-Host ($r.Content.Substring(0, [Math]::Min(250, $r.Content.Length)))
        }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}

Write-Host ""
Write-Host "=== Probe bazaarforge JS bundle for data hints ==="
try {
    $h = Invoke-WebRequest -Uri 'https://bazaarforge.gg/' -UseBasicParsing -TimeoutSec 8 -UserAgent $ua
    $jsFiles = [regex]::Matches($h.Content, '/assets/[^"]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique
    foreach ($j in $jsFiles) {
        $jsUrl = "https://bazaarforge.gg$j"
        try {
            $c = (Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 15 -UserAgent $ua).Content
            Write-Host "$j size=$($c.Length)"
            $apis = [regex]::Matches($c, 'https?://[^"`'']+\.(?:json|com|net)[^"`'' ]*') | ForEach-Object { $_.Value } | Sort-Object -Unique
            $apis | Where-Object { $_ -notlike '*google*' -and $_ -notlike '*gstatic*' -and $_ -notlike '*sentry*' } | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }
        } catch {}
    }
} catch { Write-Host "ERR $($_.Exception.Message)" }
