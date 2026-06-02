$urls = @(
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Mak-Athanor.avif',
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Vanessa-Anchor.avif',
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Common-Bandage.avif',
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Pygmalien-Abacus.avif',
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Dooley-3DPrinter.avif',
    'https://howbazaar-images.b-cdn.net/images/preview/thumbnail-Pygmalien-28HourFitness.avif'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop
        Write-Host "OK $($r.StatusCode) Len=$($r.Content.Length)  $u"
    } catch {
        Write-Host "ERR $($_.Exception.Message)  $u"
    }
}
