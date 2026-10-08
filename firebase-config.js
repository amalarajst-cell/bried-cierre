// Configuración de Conexión a la Nube (Firebase Firestore)
// Sincronización oficial en tiempo real para "Cierre de Jornada"

window.DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCjWqQ5ZgmSqZUAYnaKkEisenbOni_Ah0w",
  authDomain: "cierre-jornada.firebaseapp.com",
  projectId: "cierre-jornada",
  storageBucket: "cierre-jornada.firebasestorage.app",
  messagingSenderId: "598535351262",
  appId: "1:598535351262:web:276ec6ccc3241aa5af4b4f",
  measurementId: "G-43Z6PQB6FQ"
};

// Función para obtener la configuración activa
window.getFirebaseConfig = function() {
  try {
    const saved = localStorage.getItem("firebase_config_custom");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {}

  return window.DEFAULT_FIREBASE_CONFIG;
};

// Inicializar Firebase Firestore automáticamente
window.initFirebaseDB = function() {
  if (window._firebaseDBInitialized && window._firebaseDB) {
    return window._firebaseDB;
  }
  
  const config = window.getFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) {
    console.log("ℹ️ No hay configuración de Firebase activa.");
    return null;
  }

  try {
    if (typeof firebase === "undefined") {
      console.warn("SDK de Firebase aún no disponible.");
      return null;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    const db = firebase.firestore();
    window._firebaseDB = db;
    window._firebaseDBInitialized = true;
    console.log("✓ Sincronización en la nube activa con Firebase Firestore:", config.projectId);
    return db;
  } catch (err) {
    console.error("Error al inicializar Firebase Firestore:", err);
    return null;
  }
};
