$ErrorActionPreference = 'Continue'
# Probe alternative data sources for hero-attributed item lists

$candidates = @(
    'https://bazaarforge.gg/',
    'https://thebazaarzone.com/items/',
    'https://thebazaar.wiki.gg/',
    'https://bazaardb.gg/'
)

foreach ($u in $candidates) {
    Write-Host "=== $u ==="
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $c = $r.Content
        Write-Host "  HTML size: $($c.Length)"
        # Find JS files
        $js = [regex]::Matches($c, '/[a-zA-Z0-9_/\-\.]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique
        Write-Host "  JS refs: $($js.Count)"
        $js | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" }
        # Find data refs
        $jsons = [regex]::Matches($c, 'https?://[^"`'']+\.json') | ForEach-Object { $_.Value } | Sort-Object -Unique
        Write-Host "  JSON refs:"
        $jsons | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" }
        # Karnok mentions in HTML
        if ($c -match 'arnok') {
            Write-Host "  HAS 'arnok' in HTML"
        }
    } catch {
        Write-Host "  ERR $($_.Exception.Message)"
    }
    Write-Host ""
}
