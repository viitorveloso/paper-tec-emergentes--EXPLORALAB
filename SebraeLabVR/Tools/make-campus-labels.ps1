# Draws transparent, high-resolution lettering from a local Windows font. No external fonts or downloads.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$labels = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'campus-labels.json') -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($label in $labels) {
    $width = 2048
    $height = [int][Math]::Max(128,[Math]::Round($width * $label.size[1] / $label.size[0]))
    $bitmap = New-Object System.Drawing.Bitmap($width,$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $fontStyle = [System.Drawing.FontStyle]::Bold
    if ($label.key -eq 'NegociosEventos') { $fontStyle = [System.Drawing.FontStyle]::Regular }
    $font = New-Object System.Drawing.Font('Arial',200,$fontStyle,[System.Drawing.GraphicsUnit]::Pixel)
    $format = [System.Drawing.StringFormat]::GenericTypographic.Clone()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    $textPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $textPath.AddString($label.text,$font.FontFamily,[int]$fontStyle,200,(New-Object System.Drawing.PointF(0,0)),$format)
    $bounds = $textPath.GetBounds()
    $matrix = New-Object System.Drawing.Drawing2D.Matrix
    $matrix.Translate(-$bounds.X,-$bounds.Y)
    $textPath.Transform($matrix)
    $matrix.Reset()
    $matrix.Scale([single](($width-32)/$bounds.Width),[single](($height-24)/$bounds.Height))
    $textPath.Transform($matrix)
    $matrix.Reset()
    $matrix.Translate(16,12)
    $textPath.Transform($matrix)
    $graphics.FillPath([System.Drawing.Brushes]::White,$textPath)
    $bitmap.Save((Join-Path $projectRoot $label.texture),[System.Drawing.Imaging.ImageFormat]::Png)
    $matrix.Dispose(); $textPath.Dispose(); $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose(); $format.Dispose()
}
Write-Output ('CAMPUS_LABELS_OK: ' + $labels.Count + ' letreiros transparentes em alta resolucao.')