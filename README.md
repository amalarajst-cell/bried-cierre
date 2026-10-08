# App Cierre de Jornada - "Vinculación con el Futuro" 🚦

Aplicación interactiva web diseñada para el cierre de jornada con hasta **250 participantes en simultáneo**. Permite a los asistentes ingresar con su nombre y correo, responder una trivia rápida de reconocimiento de 10 señales viales tocando la imagen correspondiente, e impactar sus resultados en tiempo real en un **Panel de Control y Podio Oficial** para proyectar en pantalla gigante.

---

## 🚀 Cómo Iniciar la Aplicación

Para iniciar el servidor y comenzar la actividad, simplemente:

1. **Doble clic en el archivo:**
   ```text
   INICIAR_APP.bat
   ```
2. Esto iniciará el servidor de red automáticamente y abrirá el **Panel de Administrador** en tu navegador.

---

## 🌐 Enlaces de Acceso

- **Desde la computadora principal:**
  - App de Participantes: [http://localhost:3000](http://localhost:3000)
  - Panel de Control / Podio: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

- **Desde los celulares de los 250 participantes (conectados al mismo Wi-Fi):**
  - URL de acceso: `http://10.67.145.121:3000`
  - *O escaneando el Código QR que se muestra con el botón "Código QR" en el Panel de Admin.*

---

## 📱 Flujo de los Participantes

1. **Logueo Rápido:**
   - Nombre y Apellido.
   - Correo Electrónico.
2. **Cartel de Comienzo:**
   - Bienvenida personalizada e instrucciones claras.
   - Muestra visual de 6 señales de tránsito debajo.
   - Botón destacado en amarillo cálido (`#FFC600`): **"Comenzar Ahora"**.
3. **Desafío de 10 Preguntas:**
   - Barra de progreso turquesa menta (`#8DE2D6`) y cronómetro en vivo en milisegundos.
   - Cada pantalla muestra la consigna y **6 opciones de imágenes de señales**.
   - Al tocar la imagen correcta, el sistema registra el acierto y **avanza automáticamente a la siguiente pregunta** con una micro-transición táctil fluida.
4. **Pantalla de Finalización:**
   - Felicitaciones con resumen de **Aciertos (X/10)** y **Tiempo Total**.
   - Confirmación de impacto exitoso en el panel central.

---

## 👑 Funcionalidades del Panel de Administrador (`admin.html`)

- **Podio Oficial en Vivo (Top 3):**
  - 🥇 **1º Puesto (Oro):** Tarjeta destacada en amarillo cálido (`#FFC600`) con corona y efecto brillante.
  - 🥈 **2º Puesto (Plata)**
  - 🥉 **3º Puesto (Bronce)**
  - Criterio de clasificación: Mayor cantidad de respuestas correctas; a igual cantidad, menor tiempo de resolución.
- **Modo Proyector (Pantalla Gigante):**
  - Vista cinematográfica limpia para proyectar en el salón frente a las 250 personas para el anuncio de ganadores y entrega de reconocimientos.
- **Métricas Globales en Tiempo Real:**
  - Total de participantes finalizados.
  - Promedio de aciertos y tasa de efectividad general.
  - Mejor tiempo récord y tiempo promedio por participante.
- **Buscador y Tabla Completa:**
  - Monitoreo en vivo de los 250 participantes con posición, aciertos, tiempo con centésimas y hora de finalización.
- **Herramientas de Organización:**
  - **Botón "Código QR":** Genera un QR en pantalla para que toda la sala apunte la cámara de su celular y entre en 2 segundos.
  - **Botón "Exportar CSV":** Descarga instantánea de todos los resultados compatible con Microsoft Excel (codificación UTF-8 con BOM).
  - **Botón "Reiniciar":** Limpia la base de datos de partidas de prueba antes de comenzar el evento oficial.

---

## 🎨 Manual de Estilo y Normas Gráficas Aplicadas

- **Paleta Cromática:**
  - **Fondo base / Primario:** Azul profundo (`#153244`).
  - **Secundario / Énfasis:** Amarillo cálido (`#FFC600`).
  - **Terciario / Guía y Acentos:** Turquesa menta (`#8DE2D6`).
  - **Neutro de soporte:** Blanco (`#FFFFFF`).
- **Tipografía (Familia Archivo):**
  - Títulos principales en fondo oscuro: Archivo Bold en `#FFFFFF`.
  - Títulos en fondos claros/amarillos: Archivo Black en `#153244`.
  - Subtítulos: Archivo SemiBold en `#8DE2D6`.
  - Párrafos: Archivo Regular en `#FFFFFF`.
  - Botones principales y tarjetas clave en Amarillo cálido (`#FFC600`).
