# Servidor HTTP Zero-Configuración sobre TcpListener para Cierre de Jornada (250 participantes)
# Compatible con cualquier versión de Windows (PowerShell 5.1 / 7+) sin necesidad de privilegios de Administrador

$port = 3000
$resultsFile = Join-Path $PSScriptRoot "resultados.json"

if (-not (Test-Path $resultsFile)) {
    "[]" | Set-Content -Path $resultsFile -Encoding UTF8
}

# Obtener IP local para que los asistentes se conecten por Wi-Fi
$localIP = "localhost"
try {
    $ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | 
             Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | 
             Select-Object -First 1
    if ($ipObj) { $localIP = $ipObj.IPAddress }
} catch {}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Any, $port)
$listener.Start()

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   APP CIERRE DE JORNADA - VINCULACION CON EL FUTURO" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Servidor de red activo en el puerto $port" -ForegroundColor Green
Write-Host ""
Write-Host " - Desde esta PC:       http://localhost:$port" -ForegroundColor White
Write-Host " - Desde los celulares: http://${localIP}:$port" -ForegroundColor Yellow -BackgroundColor Black
Write-Host " - Panel de Admin:      http://localhost:$port/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host " Presiona Ctrl+C en esta ventana para detener el servidor." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$encoding = [System.Text.Encoding]::UTF8

function Get-StoredResults {
    param($path)
    $cleanList = @()
    if (Test-Path $path) {
        $raw = Get-Content -Raw -Path $path -Encoding UTF8
        if ($raw -and $raw.Trim() -ne "" -and $raw.Trim() -ne "[]") {
            try {
                $parsed = $raw | ConvertFrom-Json
                foreach ($item in @($parsed)) {
                    if ($item -and $item.nombre) {
                        $cleanList += $item
                    }
                }
            } catch {}
        }
    }
    return $cleanList
}

try {
    while ($true) {
        $client = $null
        try {
            $client = $listener.AcceptTcpClient()
            $stream = $client.GetStream()
            
            # Helper para enviar respuesta HTTP
            $sendResponse = {
                param($status, $ctype, $bytes, $extraHeaders)
                $len = if ($bytes) { $bytes.Length } else { 0 }
                $headerText = "HTTP/1.1 $status`r`n" +
                              "Access-Control-Allow-Origin: *`r`n" +
                              "Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`r`n" +
                              "Access-Control-Allow-Headers: Content-Type`r`n" +
                              "Content-Type: $ctype`r`n" +
                              "Content-Length: $len`r`n"
                if ($extraHeaders) { $headerText += $extraHeaders }
                $headerText += "`r`n"

                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
                $stream.Write($hBytes, 0, $hBytes.Length)
                if ($len -gt 0) {
                    $stream.Write($bytes, 0, $len)
                }
                $stream.Flush()
            }

            # Leer encabezados HTTP
            $headerBytesList = New-Object System.Collections.Generic.List[byte]
            while ($true) {
                $b = $stream.ReadByte()
                if ($b -lt 0) { break }
                $headerBytesList.Add([byte]$b)
                
                $cnt = $headerBytesList.Count
                if ($cnt -ge 4 -and 
                    $headerBytesList[$cnt-4] -eq 13 -and 
                    $headerBytesList[$cnt-3] -eq 10 -and 
                    $headerBytesList[$cnt-2] -eq 13 -and 
                    $headerBytesList[$cnt-1] -eq 10) {
                    break
                }
            }

            if ($headerBytesList.Count -eq 0) {
                $client.Close()
                continue
            }

            $headerString = $encoding.GetString($headerBytesList.ToArray())
            $lines = $headerString.Split("`n") | ForEach-Object { $_.Trim("`r") }
            
            $reqLine = $lines[0]
            $parts = $reqLine.Split(" ")
            $method = $parts[0].ToUpper()
            $rawUrl = if ($parts.Length -gt 1) { $parts[1] } else { "/" }
            $urlPath = $rawUrl.Split("?")[0]
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)

            # Extraer Content-Length
            $contentLength = 0
            foreach ($line in $lines) {
                if ($line.ToLower().StartsWith("content-length:")) {
                    $valStr = $line.Substring(15).Trim()
                    [int]::TryParse($valStr, [ref]$contentLength) | Out-Null
                }
            }

            # Leer cuerpo si Content-Length > 0
            $body = ""
            if ($contentLength -gt 0) {
                $bodyBytes = New-Object byte[] $contentLength
                $totalRead = 0
                while ($totalRead -lt $contentLength) {
                    $readCount = $stream.Read($bodyBytes, $totalRead, $contentLength - $totalRead)
                    if ($readCount -le 0) { break }
                    $totalRead += $readCount
                }
                $body = $encoding.GetString($bodyBytes, 0, $totalRead)
            }

            # Manejo de OPTIONS (Pre-flight CORS)
            if ($method -eq "OPTIONS") {
                & $sendResponse "200 OK" "text/plain" @() ""
                $client.Close()
                continue
            }

            # Endpoint: /api/ip
            if ($urlPath -eq "/api/ip" -and $method -eq "GET") {
                $infoObj = [PSCustomObject]@{
                    ip = $localIP
                    port = $port
                    url = "http://$($localIP):$($port)"
                }
                $jsonInfo = $infoObj | ConvertTo-Json
                $bData = $encoding.GetBytes($jsonInfo)
                & $sendResponse "200 OK" "application/json; charset=utf-8" $bData ""
                $client.Close()
                continue
            }

            # Endpoint: /api/submit
            if ($urlPath -eq "/api/submit" -and $method -eq "POST") {
                try {
                    $data = $body | ConvertFrom-Json
                    $list = @(Get-StoredResults $resultsFile)

                    $entry = [PSCustomObject]@{
                        id = [System.Guid]::NewGuid().ToString()
                        nombre = [string]$data.nombre
                        mail = [string]$data.mail
                        aciertos = [int]$data.aciertos
                        totalPreguntas = [int]$data.totalPreguntas
                        tiempoSegundos = [double]$data.tiempoSegundos
                        tiempoTexto = [string]$data.tiempoTexto
                        fecha = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                        detalles = $data.detalles
                    }

                    $list += $entry
                    $list | ConvertTo-Json -Depth 5 | Set-Content -Path $resultsFile -Encoding UTF8

                    Write-Host "[NUEVO RESULTADO] $($entry.nombre) | Aciertos: $($entry.aciertos)/10 | Tiempo: $($entry.tiempoTexto)" -ForegroundColor Green

                    $respBytes = $encoding.GetBytes('{"success":true}')
                    & $sendResponse "200 OK" "application/json; charset=utf-8" $respBytes ""
                } catch {
                    $errBytes = $encoding.GetBytes('{"success":false,"error":"Error al procesar JSON"}')
                    & $sendResponse "400 Bad Request" "application/json; charset=utf-8" $errBytes ""
                }
                $client.Close()
                continue
            }

            # Endpoint: /api/results
            if ($urlPath -eq "/api/results" -and $method -eq "GET") {
                $list = @(Get-StoredResults $resultsFile)
                $jsonStr = $list | ConvertTo-Json -Depth 5
                if (-not $jsonStr) { $jsonStr = "[]" }
                $bData = $encoding.GetBytes($jsonStr)
                & $sendResponse "200 OK" "application/json; charset=utf-8" $bData ""
                $client.Close()
                continue
            }

            # Endpoint: /api/results (DELETE)
            if ($urlPath -eq "/api/results" -and $method -eq "DELETE") {
                "[]" | Set-Content -Path $resultsFile -Encoding UTF8
                Write-Host "[REINICIO] Resultados limpiados por el Administrador." -ForegroundColor Magenta
                $respBytes = $encoding.GetBytes('{"success":true,"message":"Resultados limpiados"}')
                & $sendResponse "200 OK" "application/json; charset=utf-8" $respBytes ""
                $client.Close()
                continue
            }

            # Endpoint: /api/export (CSV)
            if ($urlPath -eq "/api/export" -and $method -eq "GET") {
                $items = @(Get-StoredResults $resultsFile)
                $sorted = $items | Sort-Object @{Expression = {$_.aciertos}; Descending = $true}, @{Expression = {$_.tiempoSegundos}; Descending = $false}

                $sb = New-Object System.Text.StringBuilder
                [void]$sb.AppendLine("Posicion,Nombre,Email,Aciertos,Total Preguntas,Tiempo (s),Tiempo Formateado,Fecha y Hora")
                $pos = 1
                foreach ($it in $sorted) {
                    $escName = '"' + ($it.nombre -replace '"', '""') + '"'
                    $escMail = '"' + ($it.mail -replace '"', '""') + '"'
                    [void]$sb.AppendLine("$pos,$escName,$escMail,$($it.aciertos),$($it.totalPreguntas),$($it.tiempoSegundos),$($it.tiempoTexto),$($it.fecha)")
                    $pos++
                }

                $bom = [byte[]](0xEF, 0xBB, 0xBF)
                $csvBytes = $encoding.GetBytes($sb.ToString())
                $fullBytes = New-Object byte[] ($bom.Length + $csvBytes.Length)
                [System.Buffer]::BlockCopy($bom, 0, $fullBytes, 0, $bom.Length)
                [System.Buffer]::BlockCopy($csvBytes, 0, $fullBytes, $bom.Length, $csvBytes.Length)

                $disp = "Content-Disposition: attachment; filename=resultados_cierre_jornada.csv`r`n"
                & $sendResponse "200 OK" "text/csv; charset=utf-8" $fullBytes $disp
                $client.Close()
                continue
            }

            # Servir Archivos Estáticos
            if ($urlPath -eq "/" -or $urlPath -eq "") {
                $urlPath = "/index.html"
            }

            $relPath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $PSScriptRoot $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $ctype = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                & $sendResponse "200 OK" $ctype $fileBytes ""
            } else {
                $msg = $encoding.GetBytes("404 No Encontrado: " + $urlPath)
                & $sendResponse "404 Not Found" "text/plain; charset=utf-8" $msg ""
            }

            $client.Close()
        } catch {
            if ($client) {
                try { $client.Close() } catch {}
            }
        }
    }
} finally {
    $listener.Stop()
}
