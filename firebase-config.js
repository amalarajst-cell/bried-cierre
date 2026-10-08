// Configuración de Conexión a la Nube (Firebase Firestore)
// Permite que los 250 participantes se sincronicen en tiempo real desde GitHub Pages o cualquier celular

window.DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Función para obtener la configuración activa (desde localStorage o predeterminada)
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

  if (window.DEFAULT_FIREBASE_CONFIG && window.DEFAULT_FIREBASE_CONFIG.projectId) {
    return window.DEFAULT_FIREBASE_CONFIG;
  }
  return null;
};

// Inicializar Firebase si hay configuración válida
window.initFirebaseDB = function() {
  if (window._firebaseDBInitialized) return window._firebaseDB;
  
  const config = window.getFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) {
    console.log("ℹ️ No hay configuración de Firebase activa. Usando modo de red local / API REST.");
    return null;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    const db = firebase.firestore();
    window._firebaseDB = db;
    window._firebaseDBInitialized = true;
    console.log("✓ Conectado exitosamente a Firebase Firestore en la nube:", config.projectId);
    return db;
  } catch (err) {
    console.error("Error al inicializar Firebase Firestore:", err);
    return null;
  }
};
