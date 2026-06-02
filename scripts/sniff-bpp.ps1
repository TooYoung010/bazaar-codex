$ErrorActionPreference = 'Continue'

# Probe bazaarplusplus.com main HTML for asset references
$r = Invoke-WebRequest -Uri 'https://bazaarplusplus.com/' -UseBasicParsing -TimeoutSec 10
Write-Host "=== Homepage HTML preview ==="
Write-Host $r.Content.Substring(0, [Math]::Min(2500, $r.Content.Length))

# Find JS / data hints
$jsFiles = [regex]::Matches($r.Content, '/assets/[^"]+\.js') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host ""
Write-Host "JS files found ($($jsFiles.Count)):"
$jsFiles | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }

$dataFiles = [regex]::Matches($r.Content, '/(?:data|api)/[^"]+\.json') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host ""
Write-Host "Data refs:"
$dataFiles | ForEach-Object { Write-Host "  $_" }

# Sniff first JS for fetch URLs
if ($jsFiles.Count -gt 0) {
    foreach ($j in ($jsFiles | Select-Object -First 5)) {
        $url = "https://bazaarplusplus.com$j"
        try {
            $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 12).Content
            Write-Host ""
            Write-Host "=== $j (size $($c.Length)) ==="
            # Search for fetch/json refs
            $hits = [regex]::Matches($c, 'https?://[^"`'']+\.json') | ForEach-Object { $_.Value } | Sort-Object -Unique
            $hits | Select-Object -First 8 | ForEach-Object { Write-Host "  JSON: $_" }
            $hits2 = [regex]::Matches($c, '"/[a-z][^"]+\.json"') | ForEach-Object { $_.Value } | Sort-Object -Unique
            $hits2 | Select-Object -First 8 | ForEach-Object { Write-Host "  PATH: $_" }
            # search for english item names that should be translated
            foreach ($probe in @('28 Hour Fitness', '"items":', 'translations', 'i18n')) {
                $idx = $c.IndexOf($probe)
                if ($idx -ge 0) {
                    $start = [Math]::Max(0, $idx - 50)
                    $len = [Math]::Min($c.Length - $start, 250)
                    Write-Host "  CTX[$probe@$idx]: $($c.Substring($start, $len))"
                }
            }
        } catch { Write-Host "  ERR $j  $($_.Exception.Message)" }
    }
}
