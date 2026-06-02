# Probe potential JSON endpoints from known Bazaar data sites
$urls = @(
    'https://www.howbazaar.gg/api/items',
    'https://www.howbazaar.gg/api/skills',
    'https://www.howbazaar.gg/api/heroes',
    'https://www.howbazaar.gg/data/items.json',
    'https://www.howbazaar.gg/data.json',
    'https://bazaardb.gg/api/items',
    'https://bazaardb.gg/api/all',
    'https://bazaardb.gg/data/items.json'
)

foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop
        $ct = $r.Headers['Content-Type']
        Write-Host "[$($r.StatusCode)] $u  | CT=$ct  | Len=$($r.Content.Length)"
        if ($r.Content.Length -gt 0) {
            $preview = $r.Content.Substring(0, [Math]::Min(200, $r.Content.Length))
            Write-Host "  Preview: $preview"
        }
    } catch {
        Write-Host "[ERR] $u  | $($_.Exception.Message)"
    }
}
