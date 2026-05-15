$ErrorActionPreference = "Stop"
$env:CI = "true"

$dbName = "fabula-ultima-db"
$binding = "fabula_ultima_db"
$wranglerConfigPath = "wrangler.jsonc"

Write-Host "Limpando d1_databases do wrangler.jsonc..."

$configContent = Get-Content $wranglerConfigPath -Raw
$configContent = $configContent -replace '("d1_databases"\s*:\s*)\[[\s\S]*?\]', '$1[]'
Set-Content $wranglerConfigPath $configContent -Encoding UTF8

Write-Host "Deletando D1 remoto..."
npx wrangler d1 delete $dbName --skip-confirmation
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Criando D1 remoto..."
npx wrangler d1 create $dbName --binding $binding --update-config --use-remote
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Aplicando migrations..."
npx wrangler d1 migrations apply $binding --remote
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "D1 resetado com sucesso."