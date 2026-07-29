$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host ""
Write-Host "==============================================="
Write-Host "  Aastha Website - Direct Source ZIP Creator"
Write-Host "==============================================="
Write-Host ""

$RequiredItems = @("index.html", "assets", "scripts")
foreach ($Item in $RequiredItems) {
    if (-not (Test-Path -LiteralPath (Join-Path $Root $Item))) {
        throw "This script is not inside the website repository root. Missing: $Item"
    }
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$RepoName = Split-Path $Root -Leaf
$Parent = Split-Path $Root -Parent
$ZipPath = Join-Path $Parent "$RepoName-latest-source-$Timestamp.zip"

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

$ExcludedFileNames = @(
    "Thumbs.db",
    "desktop.ini",
    ".DS_Store",
    "27_Create_Latest_Source_ZIP.bat",
    "28_Create_Latest_Source_ZIP_v2.bat",
    "_create_latest_source_zip.ps1",
    "_create_latest_source_zip_v2.ps1"
)

$ExcludedExtensions = @(".zip", ".pyc", ".pyo", ".log")

function Test-ExcludedRelativePath {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    $Parts = $RelativePath -split "[\\/]"
    foreach ($Part in $Parts) {
        if ($ExcludedDirectories -contains $Part) {
            return $true
        }
    }
    return $false
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
}

$Files = Get-ChildItem -LiteralPath $Root -File -Recurse -Force
$Included = 0
$Skipped = 0
$Failed = 0

$ZipStream = $null
$Archive = $null

try {
    $ZipStream = [System.IO.File]::Open(
        $ZipPath,
        [System.IO.FileMode]::CreateNew,
        [System.IO.FileAccess]::ReadWrite,
        [System.IO.FileShare]::None
    )

    $Archive = New-Object System.IO.Compression.ZipArchive(
        $ZipStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $false
    )

    foreach ($File in $Files) {
        $Relative = $File.FullName.Substring($Root.Length).TrimStart([char]'\', [char]'/')

        if (Test-ExcludedRelativePath -RelativePath $Relative) {
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

        $EntryName = $Relative.Replace("\", "/")

        try {
            $Entry = $Archive.CreateEntry(
                $EntryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            )

            $EntryStream = $null
            $SourceStream = $null
            try {
                $EntryStream = $Entry.Open()
                $SourceStream = [System.IO.File]::Open(
                    $File.FullName,
                    [System.IO.FileMode]::Open,
                    [System.IO.FileAccess]::Read,
                    [System.IO.FileShare]::ReadWrite
                )
                $SourceStream.CopyTo($EntryStream)
                $Included++
            }
            finally {
                if ($SourceStream) { $SourceStream.Dispose() }
                if ($EntryStream) { $EntryStream.Dispose() }
            }
        }
        catch {
            $Failed++
            Write-Host "WARNING: Could not include $Relative"
            Write-Host "         $($_.Exception.Message)"
        }
    }

    $ManifestText = @"
Aastha Website Source Package
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Repository folder: $RepoName
Files included: $Included
Files skipped: $Skipped
Files failed: $Failed

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
ZIP creator scripts
"@

    $ManifestEntry = $Archive.CreateEntry(
        "SOURCE_PACKAGE_MANIFEST.txt",
        [System.IO.Compression.CompressionLevel]::Optimal
    )

    $ManifestStream = $null
    $Writer = $null
    try {
        $ManifestStream = $ManifestEntry.Open()
        $Writer = New-Object System.IO.StreamWriter(
            $ManifestStream,
            (New-Object System.Text.UTF8Encoding($false))
        )
        $Writer.Write($ManifestText)
        $Writer.Flush()
    }
    finally {
        if ($Writer) { $Writer.Dispose() }
        elseif ($ManifestStream) { $ManifestStream.Dispose() }
    }
}
finally {
    if ($Archive) { $Archive.Dispose() }
    if ($ZipStream) { $ZipStream.Dispose() }
}

if (-not (Test-Path -LiteralPath $ZipPath)) {
    throw "The ZIP file was not created."
}

$ZipInfo = Get-Item -LiteralPath $ZipPath
if ($ZipInfo.Length -le 0) {
    throw "The ZIP file was created but is empty."
}

$SizeMB = [math]::Round($ZipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "SUCCESS: Latest source ZIP created."
Write-Host ""
Write-Host "File:"
Write-Host $ZipPath
Write-Host ""
Write-Host "Size: $SizeMB MB"
Write-Host "Included files: $Included"
Write-Host "Skipped files: $Skipped"
Write-Host "Failed files: $Failed"
Write-Host ""

if ($Failed -gt 0) {
    Write-Host "The ZIP was created, but review the warnings above."
}

Write-Host "Opening the folder now..."
Start-Process explorer.exe "/select,`"$ZipPath`""
