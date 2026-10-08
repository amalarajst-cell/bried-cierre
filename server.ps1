# Servidor HTTP para la App de Cierre de Jornada (250 participantes)
# Compatible con Windows PowerShell 5.1 y versiones superiores

$port = 3000
$resultsFile = Join-Path $PSScriptRoot "resultados.json"

if (-not (Test-Path $resultsFile)) {
    "[]" | Set-Content -Path $resultsFile -Encoding UTF8
}

# Obtener IP local
$localIP = "localhost"
try {
    $ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | 
             Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | 
             Select-Object -First 1
    if ($ipObj) { $localIP = $ipObj.IPAddress }
} catch {}

$listener = New-Object System.Net.HttpListener
$bound = $false

try {
    $listener.Prefixes.Add("http://*:$port/")
    $listener.Start()
    $bound = $true
} catch {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    if ($localIP -ne "localhost") {
        try {
            $listener.Prefixes.Add("http://${localIP}:$port/")
        } catch {}
    }
    $listener.Start()
    $bound = $true
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   APP CIERRE DE JORNADA - VINCULACION CON EL FUTURO" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Servidor activo y escuchando en el puerto $port" -ForegroundColor Green
Write-Host ""
Write-Host " - Desde esta PC:       http://localhost:$port" -ForegroundColor White
Write-Host " - Desde los celulares: http://${localIP}:$port" -ForegroundColor Yellow -BackgroundColor Black
Write-Host " - Panel de Admin:      http://localhost:$port/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host " Presiona Ctrl+C en esta ventana para detener el servidor." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

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

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        try {
            $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)

            # CORS Headers
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
            $res.AddHeader("Access-Control-Allow-Headers", "Content-Type")

            if ($req.HttpMethod -eq "OPTIONS") {
                $res.StatusCode = 200
                $res.Close()
                continue
            }

            # API: Info de Red (IP)
            if ($urlPath -eq "/api/ip" -and $req.HttpMethod -eq "GET") {
                $res.ContentType = "application/json; charset=utf-8"
                $infoObj = [PSCustomObject]@{
                    ip = $localIP
                    port = $port
                    url = "http://$($localIP):$($port)"
                }
                $jsonInfo = $infoObj | ConvertTo-Json
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonInfo)
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
                $res.Close()
                continue
            }

            # API: Guardar Resultado
            if ($urlPath -eq "/api/submit" -and $req.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $data = $body | ConvertFrom-Json

                $raw = Get-Content -Raw -Path $resultsFile -Encoding UTF8
                $list = @()
                if ($raw) {
                    $list = @($raw | ConvertFrom-Json)
                }

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

                $res.ContentType = "application/json; charset=utf-8"
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $res.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $res.Close()
                continue
            }

            # API: Obtener Resultados
            if ($urlPath -eq "/api/results" -and $req.HttpMethod -eq "GET") {
                $res.ContentType = "application/json; charset=utf-8"
                $raw = Get-Content -Raw -Path $resultsFile -Encoding UTF8
                if (-not $raw) { $raw = "[]" }
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
                $res.Close()
                continue
            }

            # API: Limpiar Resultados
            if ($urlPath -eq "/api/results" -and $req.HttpMethod -eq "DELETE") {
                "[]" | Set-Content -Path $resultsFile -Encoding UTF8
                Write-Host "[REINICIO] Resultados limpiados por el Administrador." -ForegroundColor Magenta
                $res.ContentType = "application/json; charset=utf-8"
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $res.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $res.Close()
                continue
            }

            # API: Exportar a CSV
            if ($urlPath -eq "/api/export" -and $req.HttpMethod -eq "GET") {
                $raw = Get-Content -Raw -Path $resultsFile -Encoding UTF8
                $items = @()
                if ($raw) { $items = @($raw | ConvertFrom-Json) }

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

                $res.ContentType = "text/csv; charset=utf-8"
                $res.AddHeader("Content-Disposition", "attachment; filename=resultados_cierre_jornada.csv")
                $bom = [byte[]](0xEF, 0xBB, 0xBF)
                $res.OutputStream.Write($bom, 0, $bom.Length)
                $csvBytes = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
                $res.OutputStream.Write($csvBytes, 0, $csvBytes.Length)
                $res.Close()
                continue
            }

            # Servir Archivos Estaticos
            if ($urlPath -eq "/" -or $urlPath -eq "") {
                $urlPath = "/index.html"
            }

            $relPath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $PSScriptRoot $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                if ($mimeTypes.ContainsKey($ext)) {
                    $res.ContentType = $mimeTypes[$ext]
                } else {
                    $res.ContentType = "application/octet-stream"
                }

                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentLength64 = $fileBytes.Length
                $res.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                $res.Close()
            } else {
                $res.StatusCode = 404
                $res.ContentType = "text/plain; charset=utf-8"
                $msg = "404 No Encontrado: " + $urlPath
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
                $res.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                $res.Close()
            }
        } catch {
            try {
                $context.Response.StatusCode = 500
                $context.Response.Close()
            } catch {}
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
