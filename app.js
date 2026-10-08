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

  // Envío al servidor y respaldo en localStorage
  function enviarResultadoAlServidor(payload) {
    // 1. Guardar siempre respaldo en localStorage por seguridad
    try {
      const historial = JSON.parse(localStorage.getItem("resultados_locales") || "[]");
      historial.push({ ...payload, fecha: new Date().toISOString() });
      localStorage.setItem("resultados_locales", JSON.stringify(historial));

      // Si hay BroadcastChannel (para actualizar tabs abiertas del admin al instante)
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel("jornada_channel");
        bc.postMessage({ type: "NUEVO_RESULTADO", data: payload });
      }
    } catch (e) {
      console.warn("Error en localStorage:", e);
    }

    // 2. Enviar por HTTP POST a la API del servidor
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Resultado impactado exitosamente en el servidor:", data);
        const syncStatusText = document.getElementById("sync-status-text");
        if (syncStatusText) {
          syncStatusText.textContent = "¡Resultado registrado con éxito en el panel central!";
        }
      })
      .catch(err => {
        console.warn("No se pudo conectar directamente con /api/submit (modo local activo):", err);
        const syncStatusText = document.getElementById("sync-status-text");
        if (syncStatusText) {
          syncStatusText.textContent = "Resultado guardado correctamente en tu dispositivo.";
        }
      });
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
