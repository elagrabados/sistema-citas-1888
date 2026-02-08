// ===============================================
// ARCHIVO: script.js (Versión v9.1 - FINAL DE HOY)
// ===============================================

// --- CONFIGURACIÓN DE USUARIOS ---
const USERS = {
    "isabela":  { pass: "admin2026",  name: "Isabella Ramos", role: "admin" },
    "paula":    { pass: "citas2026*", name: "Paula González", role: "admin" },
    "patricia": { pass: "citas2026*", name: "Patricia Bustos", role: "agente" },
    "ana":      { pass: "citas2026*", name: "Ana Chacon",     role: "agente" },
    "andrea":   { pass: "citas2026*", name: "Andrea Venegas", role: "agente" }
};

let currentUser = null;
let loginTime = null;
let captchaSum = 0; // Variable para la suma

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema v9.1 Iniciado");
    
    // --- 1. INICIAR CAPTCHA ---
    // Si esto falla, es porque no existe el elemento en el HTML
    try {
        initCaptcha();
        document.getElementById('loginUser').focus();
    } catch (e) {
        console.error("Error iniciando Captcha:", e);
    }

    // --- DATOS GLOBALES ---
    const venueData = {
        "Icon Park Orlando": { address: "8375 International Drive, Orlando, FL 32819 Suite 50", schedules: { weekday: ["11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"], weekend: ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"] }},
        "Vista Cay Resort": { address: "9650 Universal Blvd, Suite 120 Orlando, FL 32819", schedules: { any: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] }},
        "Newport Beachside Resort": { address: "16701 Collins Ave, Sunny Isles Beach, FL 33160\nHotel Newport Beachside Resort", schedules: { weekday: ["9:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"], weekend: ["8:15 AM", "10:00 AM", "12:15 PM", "2:00 PM", "3:00 PM", "4:00 PM"] }}
    };
    
    const managerInfo = { name: "Isabella Ramos", phone: "(786) 5487-7819" };

    // --- ELEMENTOS ---
    const loginOverlay = document.getElementById('loginOverlay');
    const appContent = document.getElementById('appContent');
    const btnLogin = document.getElementById('btnLogin');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const loginError = document.getElementById('loginError');
    const managerSection = document.getElementById('managerSection');
    const userDisplay = document.getElementById('userDisplay');
    const agentsGrid = document.getElementById('agentsGrid');
    
    // --- LÓGICA DE LOGIN ---
    if(btnLogin) {
        btnLogin.addEventListener('click', performLogin);
    }

    // Permitir Enter
    if(document.getElementById('captchaInput')) {
        document.getElementById('captchaInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') performLogin(); });
    }
    if(loginPass) {
        loginPass.addEventListener('keypress', (e) => { if(e.key === 'Enter') performLogin(); });
    }

    function initCaptcha() {
        const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
        const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
        captchaSum = num1 + num2;
        const capEl = document.getElementById('captchaQuestion');
        const inpEl = document.getElementById('captchaInput');
        
        if(capEl) capEl.textContent = `${num1} + ${num2} = ?`;
        if(inpEl) inpEl.value = '';
    }

    function performLogin() {
        const u = loginUser.value.toLowerCase().trim();
        const p = loginPass.value.trim();
        const cBox = document.getElementById('captchaInput');
        const c = cBox ? parseInt(cBox.value) : 0;

        // 1. Verificar Captcha
        if (isNaN(c) || c !== captchaSum) {
            loginError.textContent = "⛔ ERROR MATEMÁTICO (CAPTCHA)";
            loginError.style.display = "block";
            initCaptcha(); 
            shakeBox();
            return;
        }

        // 2. Verificar Credenciales
        if (USERS[u] && USERS[u].pass === p) {
            currentUser = USERS[u];
            loginTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
            
            loginOverlay.style.display = "none";
            appContent.style.display = "block";
            userDisplay.textContent = currentUser.name;
            
            const agenteSelect = document.getElementById('agente');
            if(agenteSelect) agenteSelect.value = currentUser.name;

            if (currentUser.role !== "admin") {
                if(managerSection) managerSection.style.display = "none";
                const clrBtn = document.getElementById('clearHistoryButton');
                if(clrBtn) clrBtn.style.display = "none";
            } else {
                if(managerSection) managerSection.style.display = "block";
                const clrBtn = document.getElementById('clearHistoryButton');
                if(clrBtn) clrBtn.style.display = "block";
            }
            
            renderStatusPanel();
            startMiamiClock();
        } else {
            loginError.textContent = "⛔ ACCESO DENEGADO";
            loginError.style.display = "block";
            shakeBox();
        }
    }

    function shakeBox() {
        const box = document.querySelector('.login-box');
        if(box) {
            box.animate([
                { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, 
                { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    }

    // --- DASHBOARD ---
    function renderStatusPanel() {
        if(!agentsGrid) return;
        agentsGrid.innerHTML = '';
        Object.keys(USERS).forEach(key => {
            const user = USERS[key];
            const isMe = (user.name === currentUser.name);
            const div = document.createElement('div');
            div.className = 'agent-status';
            const statusClass = isMe ? 'online' : '';
            const statusText = isMe ? `ENTRADA: ${loginTime}` : 'OFFLINE';
            const shortName = user.name.split(' ')[0];
            div.innerHTML = `<div class="status-light ${statusClass}"></div><span>${shortName}</span><span style="font-size:0.7em; opacity:0.7; margin-left:5px;">${statusText}</span>`;
            agentsGrid.appendChild(div);
        });
    }

    function startMiamiClock() {
        const clockEl = document.getElementById('miamiTime');
        if(!clockEl) return;
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clockEl.textContent = timeString;
        }, 1000);
    }

    // --- APP PRINCIPAL ---
    const form = document.getElementById('citaForm');
    const generateButton = document.getElementById('generateButton');
    const copySheetsButton = document.getElementById('copySheetsButton');
    const outputContainer = document.getElementById('outputContainer');
    const tipoInvitacionSelect = document.getElementById('tipoInvitacion');
    const lugarSelect = document.getElementById('lugar');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    const btnWaClient = document.getElementById('btnWaClient');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const historySearchInput = document.getElementById('historySearchInput');

    if(tipoInvitacionSelect) tipoInvitacionSelect.addEventListener('change', toggleParejaFields);
    if(lugarSelect) lugarSelect.addEventListener('change', updateHorarios);
    if(fechaInput) fechaInput.addEventListener('change', updateHorarios);
    if(generateButton) generateButton.addEventListener('click', handleGenerate);
    if(copySheetsButton) copySheetsButton.addEventListener('click', copyForSheets);

    if(btnWaClient) {
        btnWaClient.addEventListener('click', () => {
            let rawPhone = document.getElementById('telefonoCliente').value;
            let phone = rawPhone.replace(/\D/g, ''); 
            if(phone.length === 10) phone = '1' + phone;
            const message = document.getElementById('confirmationOutput').value;
            if(!phone) { alert("Número inválido"); return; }
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }
