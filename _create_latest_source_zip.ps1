$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host ""
Write-Host "==============================================="
Write-Host "  Aastha Website - Latest Source ZIP Creator"
Write-Host "==============================================="
Write-Host ""

# Basic safety check: make sure this looks like the website repository root.
$RequiredItems = @(
    "index.html",
    "assets",
    "scripts"
)

foreach ($Item in $RequiredItems) {
    if (-not (Test-Path (Join-Path $Root $Item))) {
        throw "This script is not inside the website repository root. Missing: $Item"
    }
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$RepoName = Split-Path $Root -Leaf
$Parent = Split-Path $Root -Parent

$Stage = Join-Path $env:TEMP "aastha-source-$Timestamp"
$ZipPath = Join-Path $Parent "$RepoName-latest-source-$Timestamp.zip"

if (Test-Path $Stage) {
    Remove-Item $Stage -Recurse -Force
}
New-Item -ItemType Directory -Path $Stage | Out-Null

# Folders that should not be included in the upload ZIP.
$ExcludedDirectories = @(
    ".git",
    ".venv",
    "dist",
    "backups",
    "reports",
    "__pycache__",
    ".pytest_cache",
    "_project-docs",
    "_legacy-tools",
    "content-drop",
    "schema-drop",
    "node_modules"
)

# Files that should not be included.
$ExcludedFileNames = @(
    "Thumbs.db",
    "desktop.ini",
    ".DS_Store"
)

$ExcludedExtensions = @(
    ".zip",
    ".pyc",
    ".pyo",
    ".log"
)

function Is-ExcludedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $Parts = $RelativePath -split "[\\/]"
    foreach ($Part in $Parts) {
        if ($ExcludedDirectories -contains $Part) {
            return $true
        }
    }

    return $false
}

$Files = Get-ChildItem -Path $Root -File -Recurse -Force

$Copied = 0
$Skipped = 0

foreach ($File in $Files) {
    $Relative = $File.FullName.Substring($Root.Length).TrimStart("\", "/")

    if (Is-ExcludedPath -RelativePath $Relative) {
        $Skipped++
        continue
    }

    if ($ExcludedFileNames -contains $File.Name) {
        $Skipped++
        continue
    }

    if ($ExcludedExtensions -contains $File.Extension.ToLowerInvariant()) {
        $Skipped++
        continue
    }

    # Do not include the ZIP creator itself in the source package.
    if ($File.Name -in @(
        "27_Create_Latest_Source_ZIP.bat",
        "_create_latest_source_zip.ps1"
    )) {
        $Skipped++
        continue
    }

    $Destination = Join-Path $Stage $Relative
    $DestinationFolder = Split-Path $Destination -Parent

    if (-not (Test-Path $DestinationFolder)) {
        New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
    }

    Copy-Item -LiteralPath $File.FullName -Destination $Destination -Force
    $Copied++
}

# Add a simple manifest to help identify the package.
$Manifest = @"
Aastha Website Source Package
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Repository folder: $RepoName
Files included: $Copied
Files skipped: $Skipped

Excluded:
.git
.venv
dist
backups
reports
__pycache__
.pytest_cache
_project-docs
_legacy-tools
content-drop
schema-drop
node_modules
ZIP files
Python cache files
Log files
"@

Set-Content -Path (Join-Path $Stage "SOURCE_PACKAGE_MANIFEST.txt") -Value $Manifest -Encoding UTF8

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $Stage,
    $ZipPath,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)

Remove-Item $Stage -Recurse -Force

$ZipInfo = Get-Item $ZipPath
$SizeMB = [math]::Round($ZipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "SUCCESS: Latest source ZIP created."
Write-Host ""
Write-Host "File:"
Write-Host $ZipPath
Write-Host ""
Write-Host "Size: $SizeMB MB"
Write-Host "Included files: $Copied"
Write-Host "Skipped files: $Skipped"
Write-Host ""
Write-Host "Opening the folder now..."

Start-Process explorer.exe "/select,`"$ZipPath`""
