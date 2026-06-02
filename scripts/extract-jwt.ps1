$ErrorActionPreference = 'Continue'
$ua = 'Mozilla/5.0 Chrome/121.0'
$jsUrl = 'https://bazaarforge.gg/assets/index-DQPEq9r9.js'
$c = (Invoke-WebRequest -Uri $jsUrl -UseBasicParsing -TimeoutSec 30 -UserAgent $ua).Content

# Extract full JWT
$jwts = [regex]::Matches($c, 'eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}') | ForEach-Object { $_.Value } | Sort-Object -Unique
foreach ($j in $jwts) {
    Write-Host "JWT: $j"
    Write-Host "  Length: $($j.Length)"
    # Decode the payload (middle part)
    $parts = $j.Split('.')
    if ($parts.Length -ge 2) {
        $payload = $parts[1]
        # base64url -> base64
        $payload = $payload.Replace('-', '+').Replace('_', '/')
        # pad
        switch ($payload.Length % 4) { 2 { $payload += '==' } 3 { $payload += '=' } }
        try {
            $bytes = [Convert]::FromBase64String($payload)
            $decoded = [System.Text.Encoding]::UTF8.GetString($bytes)
            Write-Host "  Decoded: $decoded"
        } catch {
            Write-Host "  Decode err: $($_.Exception.Message)"
        }
    }
    Write-Host ""
}
