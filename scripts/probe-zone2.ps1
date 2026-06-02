$ErrorActionPreference = 'Continue'
# Try thebazaarzone item listing — it might be SSR'd into HTML
$urls = @(
    'https://thebazaarzone.com/items/',
    'https://thebazaarzone.com/heroes/karnok',
    'https://thebazaarzone.com/heroes/karnok/',
    'https://thebazaarzone.com/karnok-items/',
    'https://thebazaarzone.com/items/?hero=karnok',
    'https://thebazaarzone.com/items/?cat=karnok',
    'https://api.dotgg.gg/do.php?cmd=getitems&game=thebazaar',
    'https://api.dotgg.gg/do.php?cmd=getitems&game=thebazaar&hero=karnok'
)

foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 12 -ErrorAction Stop
        $c = $r.Content
        $ct = $r.Headers['Content-Type']
        $isJson = $ct -like '*json*'
        $hasKarnok = $c -match 'Karnok' -or $c -match 'karnok'
        Write-Host "[$($r.StatusCode)] $(if($isJson){'JSON'}else{'html'}) Len=$($c.Length) hasKarnok=$hasKarnok  $u"
        if ($isJson) {
            Write-Host ($c.Substring(0, [Math]::Min(300, $c.Length)))
        }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}

# Also try wayback / curl with browser UA on bazaardb (which 403'd from PS UA)
Write-Host ""
Write-Host "=== Try bazaardb with browser UA ==="
try {
    $r = Invoke-WebRequest -Uri 'https://bazaardb.gg/items/karnok' -UseBasicParsing -TimeoutSec 15 -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    Write-Host "OK $($r.StatusCode) Len=$($r.Content.Length)"
    if ($r.Content -match 'Karnok') { Write-Host "Has Karnok" }
} catch {
    Write-Host "ERR $($_.Exception.Message)"
}
