// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// --- CONFIGURAZIONE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCC0gmQ7cLwgS4laYWBA2taJDQey12ugWE",
  authDomain: "appuntamenti-2b593.firebaseapp.com",
  projectId: "appuntamenti-2b593",
  storageBucket: "appuntamenti-2b593.firebasestorage.app",
  messagingSenderId: "935803949313",
  appId: "1:935803949313:web:e23dfdfc586ee8b529cb00",
  measurementId: "G-JBPKVPXY29"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- SELEZIONE ELEMENTI DEL MODULO ---
const bookingForm = document.getElementById('bookingForm');
const giornoSelect = document.getElementById('giorno');
const orarioSelect = document.getElementById('orario');
const msg = document.getElementById('msg');

// --- GENERA I PROSSIMI 7 GIORNI ---
function generateDays() {
    giornoSelect.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayStr = d.toISOString().split('T')[0]; // formato YYYY-MM-DD
        const option = document.createElement('option');
        option.value = dayStr;
        option.textContent = dayStr;
        giornoSelect.appendChild(option);
    }
}

// --- AGGIORNA GLI ORARI DISPONIBILI ---
async function updateAvailableSlots() {
    const selectedDay = giornoSelect.value;
    const q = query(collection(db, "prenotazioni"), where("giorno", "==", selectedDay));
    const snapshot = await getDocs(q);
    const booked = snapshot.docs.map(doc => doc.data().orario);

    Array.from(orarioSelect.options).forEach(opt => {
        opt.disabled = booked.includes(opt.value);
    });
}

// --- INIZIALIZZAZIONE ---
generateDays();
updateAvailableSlots();

// Aggiorna slot disponibili quando cambia giorno
giornoSelect.addEventListener('change', updateAvailableSlots);

// --- GESTIONE SUBMIT ---
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const indirizzo = document.getElementById('indirizzo').value.trim();
    const citta = document.getElementById('citta').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const giorno = giornoSelect.value;
    const orario = orarioSelect.value;

    if (!nome || !indirizzo || !citta || !telefono) {
        msg.textContent = "Compila tutti i campi!";
        msg.style.color = "red";
        return;
    }

    try {
        await addDoc(collection(db, "prenotazioni"), {
            nome,
            indirizzo,
            citta,
            telefono,
            giorno,
            orario,
            timestamp: serverTimestamp()
        });

        msg.textContent = "✅ Prenotazione effettuata con successo!";
        msg.style.color = "green";

        bookingForm.reset();
        generateDays();
        updateAvailableSlots();
    } catch (err) {
        console.error(err);
        msg.textContent = "❌ Errore durante la prenotazione, riprova.";
        msg.style.color = "red";
    }
});
