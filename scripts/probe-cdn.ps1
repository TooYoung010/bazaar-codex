$ErrorActionPreference = 'Continue'
# Try common paths on howbazaar-images.b-cdn.net
$cdn = 'https://howbazaar-images.b-cdn.net'
$id = '0efe7d3f-4f18-4667-89a3-ac915a93a9f5'
$nameSafe = '28_Hour_Fitness'
$name = '28 Hour Fitness'
$tries = @(
    "$cdn/items/$id.png"
    "$cdn/items/$id.avif"
    "$cdn/items/$id.webp"
    "$cdn/items/$nameSafe.png"
    "$cdn/items/$nameSafe.avif"
    "$cdn/items/$($name -replace ' ','-').png"
    "$cdn/items/$($name -replace ' ','-').avif"
    "$cdn/items/$($name -replace ' ','%20').png"
    "$cdn/$id.png"
    "$cdn/$nameSafe.png"
    "$cdn/$nameSafe.avif"
    "$cdn/$($name -replace ' ','_').avif"
    "$cdn/items/$name.avif"
    "$cdn/items/$($name).avif"
)
foreach ($u in $tries) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[$($r.StatusCode)] $($r.Headers['Content-Length']) $u"
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'ERR' }
        Write-Host "[$code] $u"
    }
}
