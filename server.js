// Servidor HTTP de Alto Rendimiento para Cierre de Jornada (250 participantes)
// Utiliza únicamente módulos nativos de Node.js (Sin dependencias externas ni npm install)

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const RESULTS_FILE = path.join(__dirname, 'resultados.json');

// Asegurar archivo de resultados
if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, '[]', 'utf8');
}

// Obtener IP local de la máquina en la red Wi-Fi / Ethernet
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// Tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API: Obtener IP y URL para el QR Code
  if (pathname === '/api/ip' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ip: localIP,
      port: PORT,
      url: `http://${localIP}:${PORT}`
    }));
    return;
  }

  // API: Registrar resultado de participante
  if (pathname === '/api/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        let list = [];
        try {
          const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
          list = JSON.parse(raw);
        } catch (e) {
          list = [];
        }

        const now = new Date();
        const fechaHora = now.toLocaleString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          nombre: data.nombre || 'Anónimo',
          mail: data.mail || '',
          aciertos: Number(data.aciertos) || 0,
          totalPreguntas: Number(data.totalPreguntas) || 10,
          tiempoSegundos: Number(data.tiempoSegundos) || 0,
          tiempoTexto: data.tiempoTexto || '00:00.00',
          fecha: fechaHora,
          detalles: data.detalles || []
        };

        list.push(entry);
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(list, null, 2), 'utf8');

        console.log(`\x1b[32m[NUEVO RESULTADO]\x1b[0m ${entry.nombre} | Aciertos: ${entry.aciertos}/10 | Tiempo: ${entry.tiempoTexto}`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, entry }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'JSON inválido' }));
      }
    });
    return;
  }

  // API: Obtener lista de resultados
  if (pathname === '/api/results' && req.method === 'GET') {
    try {
      const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(raw);
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end('[]');
    }
    return;
  }

  // API: Reiniciar resultados
  if (pathname === '/api/results' && req.method === 'DELETE') {
    fs.writeFileSync(RESULTS_FILE, '[]', 'utf8');
    console.log('\x1b[35m[REINICIO]\x1b[0m Base de datos de resultados limpiada.');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, message: 'Resultados reiniciados' }));
    return;
  }

  // API: Exportar a CSV
  if (pathname === '/api/export' && req.method === 'GET') {
    let list = [];
    try {
      list = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    } catch (e) {}

    list.sort((a, b) => {
      if (b.aciertos !== a.aciertos) return b.aciertos - a.aciertos;
      return (a.tiempoSegundos || 9999) - (b.tiempoSegundos || 9999);
    });

    let csv = 'Posicion,Nombre,Email,Aciertos,Total Preguntas,Tiempo (s),Tiempo Formateado,Fecha y Hora\r\n';
    list.forEach((item, index) => {
      const escName = `"${(item.nombre || '').replace(/"/g, '""')}"`;
      const escMail = `"${(item.mail || '').replace(/"/g, '""')}"`;
      csv += `${index + 1},${escName},${escMail},${item.aciertos},${item.totalPreguntas},${item.tiempoSegundos},${item.tiempoTexto},"${item.fecha}"\r\n`;
    });

    const bom = Buffer.from([0xEF, 0xBB, 0xBF]); // UTF-8 BOM para apertura perfecta en Excel
    const csvBuffer = Buffer.concat([bom, Buffer.from(csv, 'utf8')]);

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="resultados_cierre_jornada.csv"',
      'Content-Length': csvBuffer.length
    });
    res.end(csvBuffer);
    return;
  }

  // Servir archivos estáticos
  let safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, safePath);

  // Evitar salir del directorio
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Prohibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 No Encontrado: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\x1b[36m==========================================================\x1b[0m');
  console.log('\x1b[33m   APP CIERRE DE JORNADA - VINCULACIÓN CON EL FUTURO\x1b[0m');
  console.log('\x1b[36m==========================================================\x1b[0m');
  console.log(`\x1b[32m Servidor activo escuchando en el puerto ${PORT}\x1b[0m\n`);
  console.log(` - Desde esta PC:       \x1b[37mhttp://localhost:${PORT}\x1b[0m`);
  console.log(` - Desde los celulares: \x1b[33mhttp://${localIP}:${PORT}\x1b[0m`);
  console.log(` - Panel de Admin:      \x1b[36mhttp://localhost:${PORT}/admin.html\x1b[0m\n`);
  console.log(' Presiona Ctrl+C para detener el servidor.');
  console.log('\x1b[36m==========================================================\x1b[0m');
});
