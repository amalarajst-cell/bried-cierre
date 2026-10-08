New-Item -ItemType Directory -Force -Path 'assets/img' | Out-Null
$files = Get-ChildItem -Path 'senales'
$mapping = @()

foreach ($item in $files) {
    $rawName = $item.Name
    $norm = $rawName.Normalize([System.Text.NormalizationForm]::FormD)
    $clean = [regex]::Replace($norm, '\p{Mn}', '')
    $clean = $clean -replace ' ', '_'
    $dest = Join-Path 'assets/img' $clean
    Copy-Item -LiteralPath $item.FullName -Destination $dest -Force
    $mapping += [PSCustomObject]@{
        Original = $rawName
        Safe = $clean
        Path = "assets/img/$clean"
    }
}

$mapping | ConvertTo-Json | Set-Content -Path 'assets/image_mapping.json' -Encoding UTF8
Write-Output "Copied $($mapping.Count) images safely."
