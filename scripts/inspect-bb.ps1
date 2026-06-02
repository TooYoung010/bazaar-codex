$r = Invoke-WebRequest -Uri 'https://bazaar-builds.net/wp-json/wp/v2/posts?per_page=1' -UseBasicParsing -TimeoutSec 15
Write-Host ("Total posts: " + $r.Headers['X-WP-Total'])
Write-Host ("Total pages (per_page=1): " + $r.Headers['X-WP-TotalPages'])

$r2 = Invoke-WebRequest -Uri 'https://bazaar-builds.net/wp-json/wp/v2/categories?per_page=100' -UseBasicParsing -TimeoutSec 15
$j = $r2.Content | ConvertFrom-Json
Write-Host ("`nCategories total: " + $j.Count)
$j | Sort-Object count -Descending | Select-Object -First 40 | ForEach-Object {
    Write-Host ("  [{0,5}] count={1,4} parent={2,5}  {3}" -f $_.id, $_.count, $_.parent, $_.name)
}

# Tags too (might categorize by hero/skill)
$r3 = Invoke-WebRequest -Uri 'https://bazaar-builds.net/wp-json/wp/v2/tags?per_page=100' -UseBasicParsing -TimeoutSec 15
$tags = $r3.Content | ConvertFrom-Json
Write-Host ("`nTags total: " + $tags.Count)
$tags | Sort-Object count -Descending | Select-Object -First 30 | ForEach-Object {
    Write-Host ("  [{0,5}] count={1,4}  {2}" -f $_.id, $_.count, $_.name)
}
