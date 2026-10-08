// Lógica del Panel de Administración y Podio en Vivo
// Cierre de Jornada - 250 participantes

(function () {
  let allResults = [];
  let serverUrl = window.location.origin;

  // Elementos del DOM
  const metricTotalCount = document.getElementById("metric-total-count");
  const metricAvgScore = document.getElementById("metric-avg-score");
  const metricScorePct = document.getElementById("metric-score-pct");
  const metricBestTime = document.getElementById("metric-best-time");
  const metricBestName = document.getElementById("metric-best-name");
  const metricAvgTime = document.getElementById("metric-avg-time");

  const podiumCards = {
    1: {
      name: document.getElementById("podium-1-name"),
      email: document.getElementById("podium-1-email"),
      score: document.getElementById("podium-1-score"),
      time: document.getElementById("podium-1-time")
    },
    2: {
      name: document.getElementById("podium-2-name"),
      email: document.getElementById("podium-2-email"),
      score: document.getElementById("podium-2-score"),
      time: document.getElementById("podium-2-time")
    },
    3: {
      name: document.getElementById("podium-3-name"),
      email: document.getElementById("podium-3-email"),
      score: document.getElementById("podium-3-score"),
      time: document.getElementById("podium-3-time")
    }
  };

  const tbody = document.getElementById("participants-tbody");
  const searchInput = document.getElementById("table-search-input");
  const btnShowQr = document.getElementById("btn-show-qr");
  const btnCloseQr = document.getElementById("btn-close-qr");
  const qrModal = document.getElementById("qr-modal");
  const qrCanvasWrap = document.getElementById("qr-canvas-wrap");
  const qrUrlDisplay = document.getElementById("qr-url-display");
  const btnToggleProjector = document.getElementById("btn-toggle-projector");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnClearResults = document.getElementById("btn-clear-results");
  const liveIndicator = document.getElementById("live-indicator");

  // Formato de tiempo (mm:ss.cs)
  function formatSeconds(secs) {
    if (isNaN(secs) || secs === null || secs === undefined) return "--:--";
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const centis = Math.floor((secs * 100) % 100);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  }

  // 1. Cargar resultados del servidor
  async function fetchResults() {
    try {
      const res = await fetch("/api/results?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        processResults(data);
        if (liveIndicator) {
          liveIndicator.textContent = "● En Línea (Actualizado)";
          liveIndicator.style.color = "var(--color-accent)";
        }
        return;
      }
    } catch (e) {
      // Fallback a localStorage si el servidor HTTP no está respondiendo
      console.warn("Servidor no respondió, usando datos locales:", e);
    }

    // Cargar respaldo local
    try {
      const local = JSON.parse(localStorage.getItem("resultados_locales") || "[]");
      processResults(local);
      if (liveIndicator) {
        liveIndicator.textContent = "● Modo Local";
        liveIndicator.style.color = "var(--color-secondary)";
      }
    } catch (err) {
      console.error("Error al leer datos locales:", err);
    }
  }

  // 2. Procesar y ordenar resultados
  function processResults(list) {
    if (!Array.isArray(list)) return;

    // Ordenar: 1º por aciertos DESC, 2º por tiempoSegundos ASC
    allResults = list.slice().sort((a, b) => {
      if (b.aciertos !== a.aciertos) {
        return b.aciertos - a.aciertos;
      }
      return (a.tiempoSegundos || 9999) - (b.tiempoSegundos || 9999);
    });

    updateMetrics();
    updatePodium();
    renderTable();
  }

  // 3. Actualizar tarjetas de métricas
  function updateMetrics() {
    const total = allResults.length;
    metricTotalCount.textContent = total;

    if (total === 0) {
      metricAvgScore.textContent = "0.0 / 10";
      metricScorePct.textContent = "0% efectividad global";
      metricBestTime.textContent = "--:--";
      metricBestName.textContent = "Sin registros";
      metricAvgTime.textContent = "--:--";
      return;
    }

    const sumaAciertos = allResults.reduce((acc, cur) => acc + (cur.aciertos || 0), 0);
    const avgScore = (sumaAciertos / total).toFixed(1);
    const pct = ((avgScore / 10) * 100).toFixed(0);

    metricAvgScore.textContent = `${avgScore} / 10`;
    metricScorePct.textContent = `${pct}% efectividad global`;

    const mejor = allResults[0];
    metricBestTime.textContent = mejor.tiempoTexto || formatSeconds(mejor.tiempoSegundos);
    metricBestName.textContent = `${mejor.nombre} (${mejor.aciertos}/10)`;

    const sumaTiempos = allResults.reduce((acc, cur) => acc + (cur.tiempoSegundos || 0), 0);
    const avgSecs = sumaTiempos / total;
    metricAvgTime.textContent = formatSeconds(avgSecs);
  }

  // 4. Actualizar Podio (Top 3)
  function updatePodium() {
    [1, 2, 3].forEach(pos => {
      const item = allResults[pos - 1];
      const target = podiumCards[pos];

      if (item) {
        target.name.textContent = item.nombre;
        target.email.textContent = item.mail || "";
        target.score.textContent = `${item.aciertos} / 10 aciertos`;
        target.time.textContent = `⏱ ${item.tiempoTexto || formatSeconds(item.tiempoSegundos)}`;
      } else {
        target.name.textContent = "En espera...";
        target.email.textContent = "--";
        target.score.textContent = "-- aciertos";
        target.time.textContent = "--:--";
      }
    });
  }

  // 5. Renderizar Tabla de Participantes con Filtro de Búsqueda
  function renderTable() {
    const query = (searchInput.value || "").trim().toLowerCase();

    const filtrados = allResults.filter(p => {
      if (!query) return true;
      const nom = (p.nombre || "").toLowerCase();
      const mail = (p.mail || "").toLowerCase();
      return nom.includes(query) || mail.includes(query);
    });

    if (filtrados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">
            ${query ? "No se encontraron participantes que coincidan con la búsqueda." : "Aún no hay participantes registrados en la actividad."}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtrados.map(p => {
      // Posición real en el ranking general
      const realIndex = allResults.indexOf(p) + 1;
      let rankClass = "rank-badge";
      let crownIcon = "";
      if (realIndex === 1) { rankClass += " rank-1"; crownIcon = "👑 "; }
      else if (realIndex === 2) { rankClass += " rank-2"; }
      else if (realIndex === 3) { rankClass += " rank-3"; }

      const isPerfect = (p.aciertos === 10);
      const scoreBadgeClass = isPerfect ? "score-badge-table score-perfect" : "score-badge-table";

      return `
        <tr>
          <td><span class="${rankClass}">${crownIcon}${realIndex}</span></td>
          <td><strong style="color: var(--color-white); font-size: 1.05rem;">${escapeHtml(p.nombre)}</strong></td>
          <td style="color: var(--color-accent);">${escapeHtml(p.mail)}</td>
          <td>
            <span class="${scoreBadgeClass}">
              ${p.aciertos} / ${p.totalPreguntas || 10}
              ${isPerfect ? "★" : ""}
            </span>
          </td>
          <td style="font-weight: 700; color: var(--color-secondary);">${p.tiempoTexto || formatSeconds(p.tiempoSegundos)}</td>
          <td style="color: var(--color-text-muted); font-size: 0.85rem;">${p.fecha || "--"}</td>
        </tr>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m];
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderTable);
  }

  // 6. Obtener URL de Red e Inicializar QR Code
  async function initQrCode() {
    let connectUrl = window.location.href.replace(/admin\.html.*$/, "");
    if (!connectUrl.endsWith("/")) connectUrl += "/";

    try {
      const res = await fetch("/api/ip");
      if (res.ok) {
        const info = await res.json();
        if (info && info.url && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
          connectUrl = info.url;
          serverUrl = info.url;
        }
      }
    } catch (e) {
      console.log("Detectando URL estándar:", connectUrl);
    }

    if (qrUrlDisplay) {
      qrUrlDisplay.textContent = connectUrl;
    }

    if (qrCanvasWrap && typeof QRCode === "function") {
      qrCanvasWrap.innerHTML = "";
      try {
        const canvas = QRCode(connectUrl, { size: 240 });
        qrCanvasWrap.appendChild(canvas);
      } catch (err) {
        console.error("Error al generar QR:", err);
        qrCanvasWrap.textContent = "Error al renderizar código QR.";
      }
    }
  }

  if (btnShowQr) {
    btnShowQr.addEventListener("click", () => {
      initQrCode();
      qrModal.classList.add("active");
    });
  }

  if (btnCloseQr) {
    btnCloseQr.addEventListener("click", () => {
      qrModal.classList.remove("active");
    });
  }

  if (qrModal) {
    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) {
        qrModal.classList.remove("active");
      }
    });
  }

  // 7. Configuración de Base de Datos en la Nube (Firebase Firestore)
  const btnCloudConfig = document.getElementById("btn-cloud-config");
  const btnCloseCloud = document.getElementById("btn-close-cloud");
  const cloudModal = document.getElementById("cloud-modal");
  const cloudStatusText = document.getElementById("cloud-status-text");
  const cfgApiKey = document.getElementById("cfg-api-key");
  const cfgProjectId = document.getElementById("cfg-project-id");
  const cfgAppId = document.getElementById("cfg-app-id");
  const btnSaveCloud = document.getElementById("btn-save-cloud");
  const btnDisconnectCloud = document.getElementById("btn-disconnect-cloud");

  let cloudUnsubscribe = null;

  function updateCloudStatusUI() {
    const cfg = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (cfg && cfg.projectId) {
      if (cloudStatusText) {
        cloudStatusText.innerHTML = `🟢 Conectado a <strong>${escapeHtml(cfg.projectId)}</strong> (Firebase Firestore)`;
        cloudStatusText.style.color = "var(--color-accent)";
      }
      if (cfgApiKey) cfgApiKey.value = cfg.apiKey || "";
      if (cfgProjectId) cfgProjectId.value = cfg.projectId || "";
      if (cfgAppId) cfgAppId.value = cfg.appId || "";
      if (liveIndicator) {
        liveIndicator.textContent = "● Nube Activa (Tiempo Real)";
        liveIndicator.style.color = "var(--color-accent)";
      }
    } else {
      if (cloudStatusText) {
        cloudStatusText.textContent = "● Modo Servidor Local / Sin Nube";
        cloudStatusText.style.color = "var(--color-secondary)";
      }
    }
  }

  function setupCloudListener() {
    if (cloudUnsubscribe) {
      try { cloudUnsubscribe(); } catch (e) {}
      cloudUnsubscribe = null;
    }

    const db = (typeof window.initFirebaseDB === "function") ? window.initFirebaseDB() : null;
    if (!db) {
      updateCloudStatusUI();
      return false;
    }

    try {
      updateCloudStatusUI();
      cloudUnsubscribe = db.collection("resultados").onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✓ Sincronizados ${list.length} resultados desde la nube`);
        processResults(list);
        if (liveIndicator) {
          liveIndicator.textContent = `● Nube Activa (${list.length} en vivo)`;
          liveIndicator.style.color = "var(--color-accent)";
        }
      }, (err) => {
        console.warn("Error en listener de Firestore:", err);
      });
      return true;
    } catch (e) {
      console.error("Error al iniciar listener de Firebase:", e);
      return false;
    }
  }

  if (btnCloudConfig) {
    btnCloudConfig.addEventListener("click", () => {
      updateCloudStatusUI();
      cloudModal.classList.add("active");
    });
  }

  if (btnCloseCloud) {
    btnCloseCloud.addEventListener("click", () => {
      cloudModal.classList.remove("active");
    });
  }

  if (cloudModal) {
    cloudModal.addEventListener("click", (e) => {
      if (e.target === cloudModal) cloudModal.classList.remove("active");
    });
  }

  if (btnSaveCloud) {
    btnSaveCloud.addEventListener("click", () => {
      const key = (cfgApiKey.value || "").trim();
      const proj = (cfgProjectId.value || "").trim();
      const app = (cfgAppId.value || "").trim();

      if (!key || !proj) {
        alert("Por favor completa al menos la API Key y el Project ID de Firebase.");
        return;
      }

      const newConfig = {
        apiKey: key,
        authDomain: `${proj}.firebaseapp.com`,
        projectId: proj,
        storageBucket: `${proj}.appspot.com`,
        appId: app
      };

      localStorage.setItem("firebase_config_custom", JSON.stringify(newConfig));
      window._firebaseDB = null;
      window._firebaseDBInitialized = false;

      const ok = setupCloudListener();
      if (ok) {
        alert(`¡Conectado exitosamente con el proyecto ${proj}! Ahora los resultados de cualquier celular impactarán aquí en tiempo real.`);
        cloudModal.classList.remove("active");
      } else {
        alert("Verifica las credenciales ingresadas. No se pudo inicializar la conexión.");
      }
    });
  }

  if (btnDisconnectCloud) {
    btnDisconnectCloud.addEventListener("click", () => {
      if (confirm("¿Deseas desconectar Firebase y volver a modo local?")) {
        localStorage.removeItem("firebase_config_custom");
        if (cloudUnsubscribe) {
          try { cloudUnsubscribe(); } catch (e) {}
          cloudUnsubscribe = null;
        }
        window._firebaseDB = null;
        window._firebaseDBInitialized = false;
        updateCloudStatusUI();
        cloudModal.classList.remove("active");
        fetchResults();
      }
    });
  }

  // 8. Modo Proyector (Pantalla Gigante para la Jornada)
  if (btnToggleProjector) {
    btnToggleProjector.addEventListener("click", () => {
      document.body.classList.toggle("projector-mode");
      const isProj = document.body.classList.contains("projector-mode");
      btnToggleProjector.innerHTML = isProj 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 14h6m-6 0v6m16-6h-6m6 0v6M4 10h6m-6 0V4m16 6h-6m6 0V4"/></svg> Modo Normal`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> Modo Proyector`;
    });
  }

  // 9. Exportar a CSV (Compatible tanto con Servidor Local como con Nube)
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      if (allResults.length === 0) {
        alert("No hay resultados cargados para exportar.");
        return;
      }

      // Generar descarga directa desde el navegador (funciona 100% en GitHub Pages y en local)
      let csv = "\uFEFFPosicion,Nombre,Email,Aciertos,Total Preguntas,Tiempo (s),Tiempo Formateado,Fecha y Hora\r\n";
      allResults.forEach((it, idx) => {
        const escName = `"${(it.nombre || "").replace(/"/g, '""')}"`;
        const escMail = `"${(it.mail || "").replace(/"/g, '""')}"`;
        csv += `${idx + 1},${escName},${escMail},${it.aciertos},${it.totalPreguntas || 10},${it.tiempoSegundos || 0},${it.tiempoTexto || ""},"${it.fecha || ""}"\r\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "resultados_cierre_jornada.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // 10. Reiniciar / Borrar Datos
  if (btnClearResults) {
    btnClearResults.addEventListener("click", async () => {
      const confirmacion = confirm("¿Estás seguro de que deseas REINICIAR los resultados?\nEsta acción borrará todas las partidas registradas hasta el momento.");
      if (!confirmacion) return;

      // Borrar de Firebase si está conectado
      const db = (typeof window.initFirebaseDB === "function") ? window.initFirebaseDB() : null;
      if (db) {
        try {
          const snapshot = await db.collection("resultados").get();
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log("✓ Colección de Firebase reseteada");
        } catch (fbErr) {
          console.warn("Error al borrar en Firebase:", fbErr);
        }
      }

      // Borrar de servidor local si está activo
      try {
        await fetch("/api/results", { method: "DELETE" });
      } catch (e) {}

      localStorage.removeItem("resultados_locales");
      allResults = [];
      processResults([]);
      alert("Los resultados han sido reiniciados correctamente.");
    });
  }

  // 11. Escuchar BroadcastChannel para actualizaciones locales instantáneas
  if (window.BroadcastChannel) {
    const bc = new BroadcastChannel("jornada_channel");
    bc.onmessage = (msg) => {
      if (msg.data && msg.data.type === "NUEVO_RESULTADO") {
        fetchResults();
      }
    };
  }

  // Inicializar modo nube si está configurado, o modo servidor local
  const hasCloud = setupCloudListener();
  if (!hasCloud) {
    fetchResults();
    setInterval(fetchResults, 2500);
  }
  initQrCode();
})();
