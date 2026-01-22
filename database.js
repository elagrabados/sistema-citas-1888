// ===============================================
// ARCHIVO: database.js
// FUNCIÓN: Conexión a Firebase (SistemaCitas-1888)
// ===============================================

// CONFIGURACIÓN DE TU FIREBASE (Copiada de tu captura)
const firebaseConfig = {
  apiKey: "AIzaSyAfkTjF6NPgAw_RF8C8N9MySRG6eror4jY",
  authDomain: "sistemacitas-1888.firebaseapp.com",
  databaseURL: "https://sistemacitas-1888-default-rtdb.firebaseio.com",
  projectId: "sistemacitas-1888",
  storageBucket: "sistemacitas-1888.firebasestorage.app",
  messagingSenderId: "2412586809",
  appId: "1:2412586809:web:1ef322d4a7115f8fd8aae8"
};

// Inicializar Firebase (Versión compatible con tu HTML)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const appointmentsRef = database.ref('citas'); 

// Variable global para historial local
let localHistory = {};

// --- FUNCIONES ---

function addAppointmentToHistory(appointmentData) {
    const newRef = appointmentsRef.push();
    newRef.set(appointmentData)
        .then(() => {
            console.log("Cita guardada en la nube.");
            alert("✅ ¡Cita guardada en la nube correctamente!");
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("❌ Error al guardar: " + error.message);
        });
}

function listenToHistory(renderCallback) {
    appointmentsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        localHistory = data || {};
        renderCallback(localHistory);
    });
}

function clearHistoryDB() {
    appointmentsRef.remove();
}

function getAppointmentById(id) {
    return localHistory[id] || null;
}