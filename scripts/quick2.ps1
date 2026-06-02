$urls = @(
    'https://howbazaar-images.b-cdn.net/images/items/0efe7d3f-4f18-4667-89a3-ac915a93a9f5.avif',
    'https://howbazaar-images.b-cdn.net/images/items/723880db-8a97-4833-a9a1-80c75cde4c17.avif',
    'https://howbazaar-images.b-cdn.net/images/items/a05d23cb-af36-42fa-aab1-568aba7f30c6.avif'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop
        Write-Host "OK $($r.StatusCode) Len=$($r.Content.Length) CT=$($r.Headers['Content-Type'])  $u"
    } catch {
        Write-Host "ERR $($_.Exception.Message)  $u"
    }
}
