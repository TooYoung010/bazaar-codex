$ErrorActionPreference = 'Continue'
$cdn = 'https://howbazaar-images.b-cdn.net'

# Try real items
$tests = @(
    @{ hero='Mak'; name='Athanor' }
    @{ hero='Pygmalien'; name='28HourFitness' }
    @{ hero='Pygmalien'; name='28 Hour Fitness' }
    @{ hero='pygmalien'; name='28HourFitness' }
    @{ hero='Pygmalien'; name='Abacus' }
    @{ hero='Dooley'; name='3DPrinter' }
    @{ hero='Dooley'; name='3D Printer' }
    @{ hero='Dooley'; name='3-d-printer' }
    @{ hero='Common'; name='Bandage' }
    @{ hero='common'; name='Bandage' }
)
$exts = @('avif','png','webp')

foreach ($t in $tests) {
    foreach ($e in $exts) {
        # Try multiple name encodings
        $names = @(
            ($t.name -replace '\s','')      # PascalCase
            ($t.name -replace '\s','-')     # kebab
            ($t.name -replace '\s','%20')   # url-encoded
            $t.name                          # raw
        ) | Sort-Object -Unique
        foreach ($n in $names) {
            $u = "$cdn/images/preview/thumbnail-$($t.hero)-$n.$e"
            try {
                $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 4 -ErrorAction Stop
                Write-Host "OK [$($r.StatusCode)] Len=$($r.Headers['Content-Length']) $u"
            } catch {
                # silent fail
            }
        }
    }
}

Write-Host ""
Write-Host "=== Try non-preview path ==="
$tests2 = @(
    "$cdn/images/items/Athanor.avif"
    "$cdn/images/items/Mak-Athanor.avif"
    "$cdn/images/items/mak/Athanor.avif"
    "$cdn/images/Mak/Athanor.avif"
    "$cdn/items/Mak/Athanor.avif"
    "$cdn/items/Athanor.avif"
)
foreach ($u in $tests2) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head -TimeoutSec 4 -ErrorAction Stop
        Write-Host "OK [$($r.StatusCode)] $u"
    } catch {}
}
