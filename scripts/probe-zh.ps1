$urls = @(
    'https://www.howbazaar.gg/api/items?lang=zh',
    'https://www.howbazaar.gg/api/items?locale=zh',
    'https://www.howbazaar.gg/api/items?lang=zh-CN',
    'https://www.howbazaar.gg/api/items/zh',
    'https://www.howbazaar.gg/api/locales/zh',
    'https://www.howbazaar.gg/api/translations',
    'https://www.howbazaar.gg/api/i18n/zh',
    'https://bazaarplusplus.com/api/items',
    'https://bazaarplusplus.com/api/data',
    'https://bazaarplusplus.com/data/items.json',
    'https://bazaar.codecode.cn/api/items',
    'https://bazaar.codecode.cn/api/all',
    'https://bazaar.codecode.cn/data/items.json',
    'https://thebazaargame.net/api/items',
    'https://thebazaargame.net/zh/api/items'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
        $ct = $r.Headers['Content-Type']
        $preview = if ($r.Content.Length -gt 0) { $r.Content.Substring(0, [Math]::Min(150, $r.Content.Length)) } else { '' }
        Write-Host "[$($r.StatusCode)] CT=$ct Len=$($r.Content.Length)  $u"
        Write-Host "  Preview: $preview"
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
