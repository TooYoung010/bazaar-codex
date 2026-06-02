$ErrorActionPreference = 'Continue'
# Probe mrmao leaderboard API params
$urls = @(
    'https://bazaar.mrmao.life/api/leaderboard',
    'https://bazaar.mrmao.life/api/leaderboard?page=1',
    'https://bazaar.mrmao.life/api/leaderboard?page=1&pageSize=50',
    'https://bazaar.mrmao.life/api/leaderboard?page=1&size=50',
    'https://bazaar.mrmao.life/api/leaderboard?seasonId=15',
    'https://bazaar.mrmao.life/api/leaderboard?seasonId=14',
    'https://bazaar.mrmao.life/api/leaderboard?username=arcology',
    'https://bazaar.mrmao.life/api/leaderboard?q=arcology',
    'https://bazaar.mrmao.life/api/leaderboard?search=arcology',
    'https://bazaar.mrmao.life/api/leaderboard/search?q=arcology',
    'https://bazaar.mrmao.life/api/player/arcology',
    'https://bazaar.mrmao.life/api/players/arcology',
    'https://bazaar.mrmao.life/api/seasons',
    'https://bazaar.mrmao.life/api/heroes',
    'https://bazaar.mrmao.life/api/classes',
    'https://bazaar.mrmao.life/api/leaderboard?mainClass=v',
    'https://bazaar.mrmao.life/api/leaderboard?mainClass=v&seasonId=15'
)

foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
        $ct = $r.Headers['Content-Type']
        $isJson = $ct -like '*json*'
        $marker = if ($isJson) { 'JSON' } else { 'html' }
        Write-Host "[$($r.StatusCode)] $marker  Len=$($r.Content.Length)  $u"
        if ($isJson) {
            $preview = $r.Content.Substring(0, [Math]::Min(280, $r.Content.Length)) -replace '[\r\n]+', ' '
            Write-Host "   >> $preview"
        }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
