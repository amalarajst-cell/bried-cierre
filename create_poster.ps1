Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 1600

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Fondo blanco puro
$g.Clear([System.Drawing.Color]::White)

# 2. Marco exterior e interior elegante
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(21, 50, 68), 6)
$g.DrawRectangle($borderPen, 35, 35, ($width - 70), ($height - 70))

$yellowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 198, 0), 4)
$g.DrawRectangle($yellowPen, 45, 45, ($width - 90), ($height - 90))

# 3. Logo BA (Azul original sobre blanco)
$logoPath = Join-Path $PSScriptRoot "assets\img\logo_ba.png"
if (Test-Path $logoPath) {
    $logo = [System.Drawing.Bitmap]::FromFile($logoPath)
    $logoW = 340
    $logoH = [int]($logo.Height * ($logoW / $logo.Width))
    $logoX = [int](($width - $logoW) / 2)
    $logoY = 90
    $g.DrawImage($logo, $logoX, $logoY, $logoW, $logoH)
    $logo.Dispose()
}

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

# 4. Pastilla: EDUCACION VIAL ESCOLAR
$pillText = "EDUCACI" + [char]0xD3 + "N VIAL ESCOLAR"
$fontPill = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(21, 50, 68))
$pillBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 247, 245))
$pillBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(141, 226, 214), 2)

$pillW = 420
$pillH = 46
$pillX = [int](($width - $pillW) / 2)
$pillY = 240

$g.FillRectangle($pillBgBrush, $pillX, $pillY, $pillW, $pillH)
$g.DrawRectangle($pillBorderPen, $pillX, $pillY, $pillW, $pillH)
$pillRect = New-Object System.Drawing.RectangleF([float]$pillX, [float]$pillY, [float]$pillW, [float]$pillH)
$g.DrawString($pillText, $fontPill, $pillBrush, $pillRect, $sf)

# 5. Titulo Principal en Azul Profundo (#153244)
$fontTitle = New-Object System.Drawing.Font("Arial", 38, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(21, 50, 68))
$titleRect = New-Object System.Drawing.RectangleF([float]50, [float]305, [float]($width - 100), [float]70)
$titleText = "Desaf" + [char]0xED + "o de Se" + [char]0xF1 + "ales Viales"
$g.DrawString($titleText, $fontTitle, $titleBrush, $titleRect, $sf)

# 6. Subtitulo
$fontSub = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 70, 94))
$subRect = New-Object System.Drawing.RectangleF([float]80, [float]385, [float]($width - 160), [float]75)
$subText = "Escane" + [char]0xE1 + " el c" + [char]0xF3 + "digo QR con la c" + [char]0xE1 + "mara de tu celular para ingresar al juego"
$g.DrawString($subText, $fontSub, $subBrush, $subRect, $sf)

# 7. Marco y Codigo QR en el centro
$qrPath = Join-Path $PSScriptRoot "assets\img\qr_evento.png"
if (Test-Path $qrPath) {
    $qrImg = [System.Drawing.Bitmap]::FromFile($qrPath)
    $qrSize = 580
    $qrX = [int](($width - $qrSize) / 2)
    $qrY = 490
    
    # Marco amarillo de resalte
    $qrFramePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 198, 0), 8)
    $g.DrawRectangle($qrFramePen, ($qrX - 16), ($qrY - 16), ($qrSize + 32), ($qrSize + 32))

    # Marco azul suave contenedor
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(21, 50, 68), 2)
    $g.DrawRectangle($innerPen, ($qrX - 22), ($qrY - 22), ($qrSize + 44), ($qrSize + 44))

    $g.DrawImage($qrImg, $qrX, $qrY, $qrSize, $qrSize)
    $qrImg.Dispose()
}

# 8. Indicacion paso
$fontInst = New-Object System.Drawing.Font("Arial", 21, [System.Drawing.FontStyle]::Bold)
$instRect = New-Object System.Drawing.RectangleF([float]80, [float]1145, [float]($width - 160), [float]45)
$instText = "Apunt" + [char]0xE1 + " la c" + [char]0xE1 + "mara de tu celular al c" + [char]0xF3 + "digo"
$g.DrawString($instText, $fontInst, $titleBrush, $instRect, $sf)

# 9. Pastilla con Enlace Directo
$urlText = "https://amalarajst-cell.github.io/bried-cierre/"
$fontUrl = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Bold)
$urlBoxW = 780
$urlBoxH = 52
$urlBoxX = [int](($width - $urlBoxW) / 2)
$urlBoxY = 1205
$urlBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 245, 250))
$urlBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(21, 50, 68), 2)
$g.FillRectangle($urlBgBrush, $urlBoxX, $urlBoxY, $urlBoxW, $urlBoxH)
$g.DrawRectangle($urlBorderPen, $urlBoxX, $urlBoxY, $urlBoxW, $urlBoxH)
$urlRect = New-Object System.Drawing.RectangleF([float]$urlBoxX, [float]$urlBoxY, [float]$urlBoxW, [float]$urlBoxH)
$g.DrawString($urlText, $fontUrl, $titleBrush, $urlRect, $sf)

# 10. Pie de pagina
$fontFooter = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Regular)
$footerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 120, 140))
$footerRect = New-Object System.Drawing.RectangleF([float]80, [float]1500, [float]($width - 160), [float]35)
$g.DrawString("Buenos Aires Ciudad  |  Cierre de Jornada", $fontFooter, $footerBrush, $footerRect, $sf)

$outputFile = Join-Path $PSScriptRoot "assets\img\afiche_qr_imprimir.png"
$bmp.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "Afiche creado con exito: $outputFile"
