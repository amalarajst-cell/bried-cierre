// Lógica de la Aplicación del Participante
// Cierre de Jornada - Desafío de Señales Viales

(function () {
  // Estado global del participante
  const state = {
    nombre: "",
    mail: "",
    preguntaActualIndex: 0,
    aciertos: 0,
    totalPreguntas: APP_QUESTIONS.length,
    tiempoInicio: null,
    tiempoFin: null,
    tiempoInterval: null,
    tiempoSegundos: 0,
    detallesRespuestas: []
  };

  // Elementos del DOM
  const views = {
    login: document.getElementById("view-login"),
    start: document.getElementById("view-start"),
    quiz: document.getElementById("view-quiz"),
    finish: document.getElementById("view-finish")
  };

  // Controles de formulario
  const loginForm = document.getElementById("login-form");
  const inputNombre = document.getElementById("input-nombre");
  const inputMail = document.getElementById("input-mail");
  const btnStartActivity = document.getElementById("btn-start-activity");

  // Elementos del Quiz
  const questionNumberEl = document.getElementById("question-number");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const stopwatchEl = document.getElementById("stopwatch-timer");
  const questionThemeEl = document.getElementById("question-theme");
  const questionTextEl = document.getElementById("question-text");
  const optionsGridEl = document.getElementById("options-grid");

  // Elementos de Finalización
  const finishNameEl = document.getElementById("finish-name");
  const finishScoreEl = document.getElementById("finish-score");
  const finishTimeEl = document.getElementById("finish-time");
  const btnRetryEl = document.getElementById("btn-retry");

  // Cambiar vista activa
  function showView(viewName) {
    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].style.display = (key === viewName) ? "block" : "none";
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Formato de tiempo (mm:ss.cs)
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centis = Math.floor((seconds * 100) % 100);
    const mStr = mins.toString().padStart(2, "0");
    const sStr = secs.toString().padStart(2, "0");
    const cStr = centis.toString().padStart(2, "0");
    return `${mStr}:${sStr}.${cStr}`;
  }

  // 1. Manejo del Login
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nombre = inputNombre.value.trim();
      const mail = inputMail.value.trim();

      if (!nombre) {
        alert("Por favor, ingresa tu nombre y apellido para participar.");
        inputNombre.focus();
        return;
      }
      if (!mail || !mail.includes("@")) {
        alert("Por favor, ingresa un correo electrónico válido.");
        inputMail.focus();
        return;
      }

      state.nombre = nombre;
      state.mail = mail;

      // Personalizar saludo del cartel de bienvenida
      const welcomeName = document.getElementById("start-welcome-name");
      if (welcomeName) {
        welcomeName.textContent = `¡Hola, ${nombre}!`;
      }

      // Pasar a la pantalla de cartel para comenzar con 6 señales debajo
      showView("start");
    });
  }

  // 2. Iniciar la actividad
  if (btnStartActivity) {
    btnStartActivity.addEventListener("click", function () {
      state.preguntaActualIndex = 0;
      state.aciertos = 0;
      state.detallesRespuestas = [];
      state.tiempoSegundos = 0;
      state.tiempoInicio = performance.now();

      // Iniciar cronómetro
      if (state.tiempoInterval) clearInterval(state.tiempoInterval);
      state.tiempoInterval = setInterval(() => {
        const elapsed = (performance.now() - state.tiempoInicio) / 1000;
        state.tiempoSegundos = elapsed;
        if (stopwatchEl) {
          stopwatchEl.textContent = formatTime(elapsed);
        }
      }, 50);

      showView("quiz");
      renderPregunta(0);
    });
  }

  // 3. Renderizar pregunta actual
  function renderPregunta(index) {
    if (index >= APP_QUESTIONS.length) {
      finalizarActividad();
      return;
    }

    const item = APP_QUESTIONS[index];
    const total = APP_QUESTIONS.length;
    const progreso = ((index + 1) / total) * 100;

    // Actualizar barra y contadores
    if (questionNumberEl) questionNumberEl.textContent = `Pregunta ${index + 1} de ${total}`;
    if (progressBarFill) progressBarFill.style.width = `${progreso}%`;
    if (questionThemeEl) questionThemeEl.textContent = item.tema;
    if (questionTextEl) questionTextEl.textContent = item.pregunta;

    // Obtener las 6 opciones (1 correcta + 5 distractores, barajadas)
    const opciones = obtenerOpcionesBarajadas(item);
    optionsGridEl.innerHTML = "";

    let yaRespondio = false;

    opciones.forEach((opc, opcIdx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "option-card";
      card.setAttribute("aria-label", `Opción ${opcIdx + 1}`);

      const badgeNum = document.createElement("span");
      badgeNum.className = "option-badge-num";
      badgeNum.textContent = `${opcIdx + 1}`;

      const img = document.createElement("img");
      img.src = opc.img;
      img.alt = `Señal ${opcIdx + 1}`;
      img.loading = "eager";

      card.appendChild(badgeNum);
      card.appendChild(img);

      // Evento de toque / click inmediato
      card.addEventListener("click", function () {
        if (yaRespondio) return;
        yaRespondio = true;

        // Feedback táctil instantáneo
        card.classList.add("selected-tap");

        // Registrar acierto
        const esCorrecta = opc.esCorrecta === true;
        if (esCorrecta) {
          state.aciertos++;
        }

        state.detallesRespuestas.push({
          preguntaId: item.id,
          tema: item.tema,
          correcta: esCorrecta,
          tiempoParcial: state.tiempoSegundos
        });

        // Pasar AUTOMÁTICAMENTE a la siguiente pregunta de inmediato (con transición de 180ms)
        setTimeout(() => {
          state.preguntaActualIndex++;
          renderPregunta(state.preguntaActualIndex);
        }, 180);
      });

      optionsGridEl.appendChild(card);
    });
  }

  // 4. Finalizar Actividad e impactar resultado
  function finalizarActividad() {
    clearInterval(state.tiempoInterval);
    state.tiempoFin = performance.now();
    const tiempoTotalSegundos = (state.tiempoFin - state.tiempoInicio) / 1000;
    state.tiempoSegundos = parseFloat(tiempoTotalSegundos.toFixed(2));
    const tiempoFormateado = formatTime(state.tiempoSegundos);

    // Actualizar vista de finalización
    if (finishNameEl) finishNameEl.textContent = state.nombre;
    if (finishScoreEl) finishScoreEl.textContent = `${state.aciertos} / ${state.totalPreguntas}`;
    if (finishTimeEl) finishTimeEl.textContent = tiempoFormateado;

    // Enviar resultado al Panel de Admin / Servidor
    enviarResultadoAlServidor({
      nombre: state.nombre,
      mail: state.mail,
      aciertos: state.aciertos,
      totalPreguntas: state.totalPreguntas,
      tiempoSegundos: state.tiempoSegundos,
      tiempoTexto: tiempoFormateado,
      detalles: state.detallesRespuestas
    });

    showView("finish");
  }

  // Envío garantizado al servidor / Firebase Nube (SDK + REST API de respaldo directo)
  async function enviarResultadoAlServidor(payload) {
    const syncStatusText = document.getElementById("sync-status-text");
    const syncCheckIcon = document.querySelector(".sync-check-icon");
    if (syncStatusText) {
      syncStatusText.textContent = "Guardando tu resultado en el podio central...";
    }
    if (syncCheckIcon) {
      syncCheckIcon.textContent = "⏳";
    }

    // 1. Guardar siempre respaldo en localStorage por seguridad
    try {
      const historial = JSON.parse(localStorage.getItem("resultados_locales") || "[]");
      historial.push({ ...payload, fecha: new Date().toISOString() });
      localStorage.setItem("resultados_locales", JSON.stringify(historial));

      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel("jornada_channel");
        bc.postMessage({ type: "NUEVO_RESULTADO", data: payload });
      }
    } catch (e) {
      console.warn("Error en localStorage:", e);
    }

    let guardado = false;

    // 2. Intentar vía Firebase SDK oficial
    try {
      const db = (typeof window.initFirebaseDB === "function") ? window.initFirebaseDB() : null;
      if (db) {
        await db.collection("resultados").add({
          nombre: payload.nombre,
          mail: payload.mail,
          aciertos: payload.aciertos,
          totalPreguntas: payload.totalPreguntas,
          tiempoSegundos: payload.tiempoSegundos,
          tiempoTexto: payload.tiempoTexto,
          detalles: payload.detalles,
          fecha: new Date().toISOString(),
          timestamp: Date.now()
        });
        guardado = true;
        console.log("✓ Sincronizado vía Firebase SDK");
      }
    } catch (sdkErr) {
      console.warn("Firebase SDK falló o no disponible, usando REST API:", sdkErr);
    }

    // 3. Respaldo directo vía REST API de Firebase (funciona 100% nativo sin librerías externas)
    if (!guardado) {
      try {
        const cfg = (typeof window.getFirebaseConfig === "function") ? window.getFirebaseConfig() : window.DEFAULT_FIREBASE_CONFIG;
        if (cfg && cfg.projectId && cfg.apiKey) {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/resultados?key=${cfg.apiKey}`;
          const restBody = {
            fields: {
              nombre: { stringValue: payload.nombre },
              mail: { stringValue: payload.mail },
              aciertos: { integerValue: String(payload.aciertos) },
              totalPreguntas: { integerValue: String(payload.totalPreguntas) },
              tiempoSegundos: { doubleValue: Number(payload.tiempoSegundos) },
              tiempoTexto: { stringValue: String(payload.tiempoTexto) },
              fecha: { stringValue: new Date().toISOString() },
              timestamp: { integerValue: String(Date.now()) }
            }
          };
          const restRes = await fetch(restUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(restBody)
          });
          if (restRes.ok) {
            guardado = true;
            console.log("✓ Sincronizado vía Firebase REST API directo");
          }
        }
      } catch (restErr) {
        console.warn("Error en Firebase REST API:", restErr);
      }
    }

    // 4. Servidor local si está disponible
    try {
      const srvRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (srvRes.ok) {
        guardado = true;
      }
    } catch (e) {}

    // Actualizar interfaz del participante
    if (syncStatusText && syncCheckIcon) {
      if (guardado) {
        syncCheckIcon.textContent = "✓";
        syncCheckIcon.style.color = "#00e5c7";
        syncStatusText.textContent = "¡Tu resultado ha impactado exitosamente en el panel central!";
      } else {
        syncCheckIcon.textContent = "⚠️";
        syncCheckIcon.style.color = "#ffc600";
        syncStatusText.innerHTML = `Conexión lenta al enviar. <button type="button" id="btn-reintentar-envio" style="margin-left:8px;padding:4px 10px;font-size:0.85rem;background:#ffc600;color:#153244;border:none;border-radius:4px;cursor:pointer;font-weight:700;">Reintentar</button>`;
        const btnReintentar = document.getElementById("btn-reintentar-envio");
        if (btnReintentar) {
          btnReintentar.onclick = () => enviarResultadoAlServidor(payload);
        }
      }
    }
  }

  // Botón para reiniciar si desea jugar de nuevo
  if (btnRetryEl) {
    btnRetryEl.addEventListener("click", function () {
      if (confirm("¿Deseas volver a intentar la actividad?")) {
        showView("start");
      }
    });
  }

  // Acceso de Administrador con combinación Control + Alt + A
  window.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA")) {
      e.preventDefault();
      window.location.href = "admin.html";
    }
  });

  // Acceso secreto para organizadores en celular/tablet (5 toques rápidos en el logo)
  const brandLogo = document.getElementById("main-brand-logo");
  if (brandLogo) {
    let logoTaps = 0;
    let lastTapTime = 0;
    brandLogo.style.cursor = "pointer";
    brandLogo.addEventListener("click", function () {
      const now = Date.now();
      if (now - lastTapTime < 500) {
        logoTaps++;
      } else {
        logoTaps = 1;
      }
      lastTapTime = now;
      if (logoTaps >= 5) {
        window.location.href = "admin.html";
      }
    });
  }

  // Iniciar en la pantalla de login
  showView("login");
})();
