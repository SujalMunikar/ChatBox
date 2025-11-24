<#!
.SYNOPSIS
  Snapshot GitHub Copilot Chat storage (global + current workspace) into a timestamped backup inside the repo.
.DESCRIPTION
  Copies relevant folders/files from VS Code extension storage:
    - %APPDATA%\Code\User\globalStorage\github.copilot-chat
    - The hashed workspaceStorage folder that references the provided -WorkspaceRoot path.
  Produces backup folder: .copilot-chat-backups\YYYYMMDD-HHMMSS
  Optionally zips the snapshot.
.PARAMETER WorkspaceRoot
  Absolute path to the workspace root (as VS Code sees it). Default: resolves to current script's parent or provided value.
.PARAMETER Zip
  Switch: when present, creates a ZIP archive of the snapshot and removes the expanded copy.
.EXAMPLE
  ./backup-copilot-chat.ps1 -WorkspaceRoot 'd:\chatterwave' -Zip
#>
param(
  [string]$WorkspaceRoot = (Resolve-Path '.').Path,
  [switch]$Zip
)

function Resolve-WorkspaceHashFolder {
  param([string]$Root)
  $workspaceStorage = Join-Path $env:APPDATA 'Code/User/workspaceStorage'
  if (-not (Test-Path $workspaceStorage)) { return $null }
  $encoded = [System.Uri]::EscapeDataString($Root.ToLower()) -replace '%3a', ':'  # ensure colon formatting
  $candidates = Get-ChildItem $workspaceStorage -Directory
  foreach ($dir in $candidates) {
    $wsFile = Join-Path $dir.FullName 'workspace.json'
    if (Test-Path $wsFile) {
      $content = Get-Content $wsFile -Raw
      if ($content -match [Regex]::Escape($Root.ToLower())) { return $dir.FullName }
      if ($content -match [Regex]::Escape($encoded)) { return $dir.FullName }
    }
  }
  return $null
}

$globalStore = Join-Path $env:APPDATA 'Code/User/globalStorage/github.copilot-chat'
$hashFolder = Resolve-WorkspaceHashFolder -Root $WorkspaceRoot

$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$backupRoot = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..\..')) '.copilot-chat-backups'
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$dest = Join-Path $backupRoot $timestamp
New-Item -ItemType Directory -Path $dest -Force | Out-Null

Write-Host "[INFO] WorkspaceRoot: $WorkspaceRoot"
Write-Host "[INFO] Global storage: $globalStore" -ForegroundColor Cyan
if ($hashFolder) { Write-Host "[INFO] Workspace hash folder: $hashFolder" -ForegroundColor Cyan } else { Write-Warning "Workspace hash folder not found for $WorkspaceRoot" }

if (Test-Path $globalStore) {
  Copy-Item $globalStore -Destination (Join-Path $dest 'globalStorage_github.copilot-chat') -Recurse -Force
} else { Write-Warning 'Global Copilot chat storage not found.' }

if ($hashFolder) {
  $wsCopilot = Join-Path $hashFolder 'github.copilot-chat'
  if (Test-Path $wsCopilot) {
    Copy-Item $wsCopilot -Destination (Join-Path $dest 'workspaceStorage_github.copilot-chat') -Recurse -Force
  } else { Write-Warning 'Workspace github.copilot-chat folder missing.' }
}

# Capture metadata manifest
@{
  workspaceRoot = $WorkspaceRoot
  hashFolder    = $hashFolder
  created       = (Get-Date).ToString('o')
  machine       = $env:COMPUTERNAME
  user          = $env:USERNAME
} | ConvertTo-Json -Depth 3 | Out-File (Join-Path $dest 'manifest.json') -Encoding UTF8

Write-Host "[INFO] Backup created at $dest" -ForegroundColor Green

if ($Zip) {
  $zipPath = "$dest.zip"
  if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    Compress-Archive -Path $dest -DestinationPath $zipPath -Force
    Remove-Item $dest -Recurse -Force
    Write-Host "[INFO] Compressed to $zipPath" -ForegroundColor Green
  } else {
    Write-Warning 'Compress-Archive not available in this PowerShell version.'
  }
}

Write-Host "[NEXT] Consider scheduling this script weekly or daily via Task Scheduler." -ForegroundColor Yellow
