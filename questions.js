// Banco de Preguntas y Señales para la Actividad de Cierre de Jornada
// Paleta y estilo: "Vinculación con el futuro"

const APP_QUESTIONS = [
  {
    id: 1,
    tema: "Zona escolar",
    pregunta: "¿Qué señal preventiva te advierte sobre la cercanía de un establecimiento educativo y la posible presencia de menores cruzando la calzada?",
    imagenCorrecta: "assets/img/Zona_escolares-BVj_v7gh.png",
    nombreCorrecto: "Zona escolar",
    distractores: [
      { img: "assets/img/Hombres_trabajando-CtKlKFKG.png", nombre: "Hombres trabajando" },
      { img: "assets/img/Ciclista-MyoGuhbc.jpg", nombre: "Ciclistas" },
      { img: "assets/img/Personas_trabajando-BR9HqRud.png", nombre: "Personas trabajando" },
      { img: "assets/img/Calzada_resbaladiza-DkPmgZ9p.png", nombre: "Calzada resbaladiza" },
      { img: "assets/img/Cruce_ferroviario-liRKT5vr.png", nombre: "Cruce ferroviario" }
    ]
  },
  {
    id: 2,
    tema: "Aeródromo / Aeropuerto",
    pregunta: "¿Qué señal informativa te indica la proximidad o el acceso a una estación aérea o pista de aterrizaje?",
    imagenCorrecta: "assets/img/Aerodromo-D0NCwVxU.png",
    nombreCorrecto: "Aeródromo / Aeropuerto",
    distractores: [
      { img: "assets/img/Estacion_de_servicio-D_JQo82x.png", nombre: "Estación de servicio" },
      { img: "assets/img/Restaurante-DuS3tIK6.png", nombre: "Restaurante" },
      { img: "assets/img/Puesto_sanitario-7zeG4TqU.png", nombre: "Puesto sanitario" },
      { img: "assets/img/Policia-BeaPsXac.png", nombre: "Policía" },
      { img: "assets/img/Gomeria-CHqLuJu8.png", nombre: "Gomería" }
    ]
  },
  {
    id: 3,
    tema: "Badén",
    pregunta: "¿Qué señal de advertencia indica la presencia de una depresión o desnivel cóncavo transversal en la calzada?",
    imagenCorrecta: "assets/img/Baden-jxmBujiZ.png",
    nombreCorrecto: "Badén",
    distractores: [
      { img: "assets/img/Camino_sinuoso-BwfWP0W1.png", nombre: "Camino sinuoso" },
      { img: "assets/img/Calzada_resbaladiza-DkPmgZ9p.png", nombre: "Calzada resbaladiza" },
      { img: "assets/img/Estrechamiento_de_calzada-BsPxdRUo.png", nombre: "Estrechamiento de calzada" },
      { img: "assets/img/Puente_angosto-0b6NIfJd.png", nombre: "Puente angosto" },
      { img: "assets/img/Zona_de_derrumbes-DMFvqksm.png", nombre: "Zona de derrumbes" }
    ]
  },
  {
    id: 4,
    tema: "Banderillero",
    pregunta: "¿Qué señal transitoria de obra advierte que el tránsito está siendo dirigido temporalmente por personal operativo con una bandera?",
    imagenCorrecta: "assets/img/Banderillero-DcXCvhmd.png",
    nombreCorrecto: "Banderillero",
    distractores: [
      { img: "assets/img/Hombres_trabajando-CtKlKFKG.png", nombre: "Hombres trabajando" },
      { img: "assets/img/Valla_de_obra-Du1SSL8p.png", nombre: "Valla de obra" },
      { img: "assets/img/Equipo_pesado_en_la_via-DJnRkdnH.png", nombre: "Equipo pesado en la vía" },
      { img: "assets/img/Fin_de_construccion-CTqAs9WR.png", nombre: "Fin de construcción" },
      { img: "assets/img/Longitud_en_la_construccion-BO0K8AsS.png", nombre: "Longitud en construcción" }
    ]
  },
  {
    id: 5,
    tema: "Calzada resbaladiza",
    pregunta: "¿Qué señal preventiva te advierte que el pavimento puede perder adherencia y volverse resbaladizo bajo ciertas condiciones climáticas?",
    imagenCorrecta: "assets/img/Calzada_resbaladiza-DkPmgZ9p.png",
    nombreCorrecto: "Calzada resbaladiza",
    distractores: [
      { img: "assets/img/Camino_sinuoso-BwfWP0W1.png", nombre: "Camino sinuoso" },
      { img: "assets/img/Baden-jxmBujiZ.png", nombre: "Badén" },
      { img: "assets/img/Curva_comun-BJ4SncNt.png", nombre: "Curva común" },
      { img: "assets/img/Zona_de_derrumbes-DMFvqksm.png", nombre: "Zona de derrumbes" },
      { img: "assets/img/Puente_angosto-0b6NIfJd.png", nombre: "Puente angosto" }
    ]
  },
  {
    id: 6,
    tema: "Camino sinuoso",
    pregunta: "¿Qué señal preventiva advierte la proximidad de una serie de tres o más curvas sucesivas en la calzada?",
    imagenCorrecta: "assets/img/Camino_sinuoso-BwfWP0W1.png",
    nombreCorrecto: "Camino sinuoso",
    distractores: [
      { img: "assets/img/Curva_comun-BJ4SncNt.png", nombre: "Curva común" },
      { img: "assets/img/Calzada_resbaladiza-DkPmgZ9p.png", nombre: "Calzada resbaladiza" },
      { img: "assets/img/Incorporacion_de_transito_lateral-BWr2xBJ3.png", nombre: "Tránsito lateral" },
      { img: "assets/img/Baden-jxmBujiZ.png", nombre: "Badén" },
      { img: "assets/img/Tunel-BdPLgJMF.png", nombre: "Túnel" }
    ]
  },
  {
    id: 7,
    tema: "Ciclistas",
    pregunta: "¿Qué señal de prevención indica una zona con circulación frecuente o cruce habitual de bicicletas?",
    imagenCorrecta: "assets/img/Ciclista-MyoGuhbc.jpg",
    nombreCorrecto: "Ciclistas",
    distractores: [
      { img: "assets/img/Senda_para_ciclistas-CHrNBAtS.png", nombre: "Senda ciclistas (reglamentaria)" },
      { img: "assets/img/Prohibicion_de_circular_motos-_okAS-qM.png", nombre: "Prohibición motos" },
      { img: "assets/img/Prohibicion_de_circular_autos-BUXGb_CE.png", nombre: "Prohibición autos" },
      { img: "assets/img/Zona_escolares-BVj_v7gh.png", nombre: "Zona escolar" },
      { img: "assets/img/Personas_trabajando-BR9HqRud.png", nombre: "Personas trabajando" }
    ]
  },
  {
    id: 8,
    tema: "Comienzo de autopista",
    pregunta: "¿Qué señal informativa indica el ingreso a una vía multicarril con calzadas separadas, control total de accesos y velocidades reglamentarias específicas?",
    imagenCorrecta: "assets/img/Comienzo_de_autopista-C7zm_IQw.png",
    nombreCorrecto: "Comienzo de autopista",
    distractores: [
      { img: "assets/img/Fin_de_autopista-ByM-4O3a.png", nombre: "Fin de autopista" },
      { img: "assets/img/Indicadora_de_utilizacion_de_carriles-DZsPwDu3.png", nombre: "Uso de carriles" },
      { img: "assets/img/Desvio_por_cambio_de_sentido_de_circulacion-DhdnhThe.png", nombre: "Desvío sentido" },
      { img: "assets/img/Esquema_de_recorrido-Dln6UQ78.png", nombre: "Esquema recorrido" },
      { img: "assets/img/Orientacion_-_En_caminos_primarios_y_secundarios-Bzc0Dexv.png", nombre: "Orientación" }
    ]
  },
  {
    id: 9,
    tema: "Contramano / Sentido prohibido",
    pregunta: "¿Qué señal reglamentaria prohíbe de forma absoluta continuar la marcha o ingresar a una arteria en la dirección en la que venís circulando?",
    imagenCorrecta: "assets/img/Contramano-DIXpxLEm.png",
    nombreCorrecto: "Contramano",
    distractores: [
      { img: "assets/img/Prohibido_girar_a_la_izquierda-wR5olTOd.png", nombre: "Prohibido girar izquierda" },
      { img: "assets/img/Prohibido_girar_en_U-VraWjoJX.png", nombre: "Prohibido giro en U" },
      { img: "assets/img/Prohibido_adelantar-5GQZmguS.png", nombre: "Prohibido adelantar" },
      { img: "assets/img/Prohibido_estacionar-DYZaAM8d.png", nombre: "Prohibido estacionar" },
      { img: "assets/img/Prohibido_estacionar_y_detenerse-BgIhFWBE.png", nombre: "Estacionar y detenerse" }
    ]
  },
  {
    id: 10,
    tema: "Cruce ferroviario",
    pregunta: "¿Qué señal horizontal o vertical te advierte con anticipación sobre la proximidad de un paso a nivel con vías de tren?",
    imagenCorrecta: "assets/img/Cruce_ferroviario-liRKT5vr.png",
    nombreCorrecto: "Cruce ferroviario",
    distractores: [
      { img: "assets/img/Puente_angosto-0b6NIfJd.png", nombre: "Puente angosto" },
      { img: "assets/img/Tunel-BdPLgJMF.png", nombre: "Túnel" },
      { img: "assets/img/Estrechamiento_de_calzada-BsPxdRUo.png", nombre: "Estrechamiento calzada" },
      { img: "assets/img/Baden-jxmBujiZ.png", nombre: "Badén" },
      { img: "assets/img/Zona_de_derrumbes-DMFvqksm.png", nombre: "Zona derrumbes" }
    ]
  }
];

// Helper para barajar opciones
function obtenerOpcionesBarajadas(pregunta) {
  const todas = [
    { img: pregunta.imagenCorrecta, esCorrecta: true, nombre: pregunta.nombreCorrecto },
    ...pregunta.distractores.map(d => ({ img: d.img, esCorrecta: false, nombre: d.nombre }))
  ];
  // Algoritmo Fisher-Yates
  for (let i = todas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [todas[i], todas[j]] = [todas[j], todas[i]];
  }
  return todas;
}
