param(
  [Parameter(Position = 0)]
  [string]$Command = "start",
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Rest
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Root) {
  Write-Host "ERROR: Could not resolve start.ps1 path. Run: .\start.ps1" -ForegroundColor Red
  exit 1
}
Set-Location $Root
Write-Host "VitaCircle: starting '$Command'..."

# Stale Cursor/PowerShell sessions will not see PATH changes from a just-installed Docker Desktop.
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machinePath;$userPath;$env:Path"

function Add-ToPathIfExists([string]$dir) {
  if (Test-Path $dir) {
    $env:Path = "$dir;" + $env:Path
  }
}

Add-ToPathIfExists "C:\Program Files\nodejs"
Add-ToPathIfExists "C:\Program Files\Docker\Docker\resources\bin"
Add-ToPathIfExists "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin"
Add-ToPathIfExists "$env:LOCALAPPDATA\Docker\bin"
Add-ToPathIfExists "C:\Program Files\Git\cmd"

$node = Get-Command node -ErrorAction SilentlyContinue
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
  $dockerCandidates = @(
    "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe",
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
  )
  foreach ($exe in $dockerCandidates) {
    if (Test-Path $exe) {
      Add-ToPathIfExists (Split-Path $exe -Parent)
      $docker = Get-Command docker -ErrorAction SilentlyContinue
      break
    }
  }
}

if (-not $node) {
  Write-Host "ERROR: Node.js is required. Install Node 20+ from https://nodejs.org/ then retry." -ForegroundColor Red
  exit 1
}
if (-not $docker) {
  Write-Host @"
ERROR: docker.exe was not found on PATH.

Docker Desktop may be installed but this terminal is stale, or it is a per-user install.
Close this terminal, open a new one, and run: .\start.ps1
"@ -ForegroundColor Red
  exit 1
}

& node "$Root\scripts\dev-env.mjs" $Command @Rest
exit $LASTEXITCODE
