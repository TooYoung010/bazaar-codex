$ErrorActionPreference = 'Continue'
$ua = 'Mozilla/5.0 Chrome/121.0'

# Find official news/patch endpoints
$candidates = @(
    # Official site
    'https://playthebazaar.com/blog',
    'https://playthebazaar.com/news',
    'https://playthebazaar.com/patches',
    'https://playthebazaar.com/wp-json/wp/v2/posts',
    'https://playthebazaar.com/api/news',
    # Tempo (developer)
    'https://tempo.gg/the-bazaar/news',
    'https://soren.com/api/news',
    'https://soren.com/en/api/news',
    'https://soren.com/wp-json/wp/v2/posts',
    'https://soren.com/en/feed/',
    'https://soren.com/feed/',
    # Steam news (very useful: official patch notes)
    'https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=1617400&count=10&maxlength=1000&format=json',
    # bazaar-builds news
    'https://bazaar-builds.net/wp-json/wp/v2/categories?slug=news',
    'https://bazaar-builds.net/wp-json/wp/v2/categories?slug=patch',
    # bazaarforge news - check changelogs too
    'https://bazaarforge.gg/news',
    # The Bazaar Reddit
    'https://www.reddit.com/r/PlayTheBazaar/new.json?limit=10'
)

foreach ($u in $candidates) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -UserAgent $ua -ErrorAction Stop
        $ct = $r.Headers['Content-Type']
        $isJson = $ct -like '*json*'
        $size = $r.Content.Length
        Write-Host "[$($r.StatusCode)] $(if($isJson){'JSON'}else{'html'}) Len=$size  $u"
        if ($isJson) {
            $preview = $r.Content.Substring(0, [Math]::Min(220, $r.Content.Length)) -replace '\s+',' '
            Write-Host "   >> $preview"
        }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
