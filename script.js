// Scroll lento per i link interni
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// --- Mostra form quando si clicca "Prenota ora" ---
document.getElementById('openBooking').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('bookingContainer').style.display = 'block';
});

// --- Firebase modular via CDN ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "API_KEY_TUA",
  authDomain: "appuntamenti-2b593.firebaseapp.com",
  projectId: "appuntamenti-2b593",
  storageBucket: "appuntamenti-2b593.firebasestorage.app",
  messagingSenderId: "935803949313",
  appId: "1:935803949313:web:e23dfdfc586ee8b529cb00",
  measurementId: "G-JBPKVPXY29"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Genera giorni dinamici ---
const giornoSelect = document.getElementById('giorno');
const orarioSelect = document.getElementById('orario');
const bookingForm = document.getElementById('bookingForm');
const msg = document.getElementById('msg');

function generateDays() {
    giornoSelect.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayStr = d.toISOString().split('T')[0];
        const option = document.createElement('option');
        option.value = dayStr;
        option.textContent = dayStr;
        giornoSelect.appendChild(option);
    }
}

async function updateAvailableSlots() {
    const selectedDay = giornoSelect.value;
    const q = query(collection(db, "prenotazioni"), where("giorno", "==", selectedDay));
    const snapshot = await getDocs(q);
    const booked = snapshot.docs.map(doc => doc.data().orario);

    Array.from(orarioSelect.options).forEach(opt => {
        opt.disabled = booked.includes(opt.value);
    });
}

generateDays();
updateAvailableSlots();
giornoSelect.addEventListener('change', updateAvailableSlots);

// --- Submit prenotazione ---
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
            nome, indirizzo, citta, telefono, giorno, orario,
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
