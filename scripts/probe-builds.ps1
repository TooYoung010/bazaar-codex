$ErrorActionPreference = 'Continue'
# Probe likely build data endpoints across all candidate sites
$candidates = @(
    # mobalytics
    'https://mobalytics.gg/api/the-bazaar/builds',
    'https://app.mobalytics.gg/api/v1/the-bazaar/builds',
    'https://api.mobalytics.gg/the-bazaar/builds',
    'https://mobalytics.gg/the-bazaar/api/builds',
    'https://mobalytics.gg/api/v1/lol/the-bazaar/builds',
    # bazaar-builds.net
    'https://bazaar-builds.net/api/builds',
    'https://bazaar-builds.net/api/decks',
    'https://bazaar-builds.net/data/builds.json',
    'https://bazaar-builds.net/wp-json/wp/v2/posts',
    'https://bazaar-builds.net/wp-json/wp/v2/builds',
    # bazaarforge.gg
    'https://bazaarforge.gg/api/builds',
    'https://bazaarforge.gg/api/decks',
    'https://api.bazaarforge.gg/builds',
    # thebazaarzone
    'https://thebazaarzone.com/api/builds',
    # bazaar.mrmao.life (ranking site mentioned by user)
    'https://bazaar.mrmao.life/api/builds',
    'https://bazaar.mrmao.life/api/decks',
    'https://bazaar.mrmao.life/api/leaderboard',
    'https://bazaar.mrmao.life/api/players',
    # howbazaar bonus endpoints (might have build data we missed)
    'https://www.howbazaar.gg/api/builds',
    'https://www.howbazaar.gg/api/decks',
    'https://www.howbazaar.gg/api/encounters',
    'https://www.howbazaar.gg/api/heroes',
    # bpp extras
    'https://bpp-static.bazaarplusplus.com/builds.json',
    'https://bpp-static.bazaarplusplus.com/decks.json',
    'https://bpp-static.bazaarplusplus.com/meta.json'
)

foreach ($u in $candidates) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
        $ct = $r.Headers['Content-Type']
        $isJson = $ct -like '*json*'
        $marker = if ($isJson) { '*JSON*' } else { 'html' }
        $preview = if ($r.Content.Length -gt 0) {
            $p = $r.Content.Substring(0, [Math]::Min(120, $r.Content.Length))
            $p -replace "[\r\n]+", ' '
        } else { '' }
        Write-Host "[$($r.StatusCode)] $marker  Len=$($r.Content.Length)  $u"
        if ($isJson) { Write-Host "   >> $preview" }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
