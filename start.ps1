param(
  [Parameter(Position = 0)]
  [string]$Command = "start",
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Rest
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$nodeDir = "C:\Program Files\nodejs"
if (Test-Path (Join-Path $nodeDir "node.exe")) {
  $env:Path = "$nodeDir;" + $env:Path
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Error "Node.js is required to run the environment orchestrator. Install Node 20+ and retry."
}

& node "$Root\scripts\dev-env.mjs" $Command @Rest
exit $LASTEXITCODE
