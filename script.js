// ===============================================
// ARCHIVO: script.js (Versión v9.0 - CAPTCHA y Fix Login)
// ===============================================

const USERS = {
    "isabela":  { pass: "admin2026",  name: "Isabella Ramos", role: "admin" },
    "paula":    { pass: "citas2026*", name: "Paula González", role: "admin" },
    "patricia": { pass: "citas2026*", name: "Patricia Bustos", role: "agente" },
    "ana":      { pass: "citas2026*", name: "Ana Chacon",     role: "agente" },
    "andrea":   { pass: "citas2026*", name: "Andrea Venegas", role: "agente" }
};

let currentUser = null;
let loginTime = null;
let captchaSum = 0; // Variable para guardar el resultado del captcha

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INICIALIZAR CAPTCHA AL CARGAR ---
    initCaptcha();
    
    // Enfocar usuario
    document.getElementById('loginUser').focus();

    // DATOS GLOBALES
    const venueData = {
        "Icon Park Orlando": { address: "8375 International Drive, Orlando, FL 32819 Suite 50", schedules: { weekday: ["11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"], weekend: ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"] }},
        "Vista Cay Resort": { address: "9650 Universal Blvd, Suite 120 Orlando, FL 32819", schedules: { any: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] }},
        "Newport Beachside Resort": { address: "16701 Collins Ave, Sunny Isles Beach, FL 33160\nHotel Newport Beachside Resort", schedules: { weekday: ["9:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"], weekend: ["8:15 AM", "10:00 AM", "12:15 PM", "2:00 PM", "3:00 PM", "4:00 PM"] }}
    };
    
    const managerInfo = { name: "Isabella Ramos", phone: "(786) 5487-7819" };

    // ELEMENTOS DOM
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
    btnLogin.addEventListener('click', performLogin);
    
    // Permitir login con ENTER en cualquier campo
    document.getElementById('captchaInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') performLogin(); });
    loginPass.addEventListener('keypress', (e) => { if(e.key === 'Enter') performLogin(); });

    function initCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1; // 1 a 10
        const num2 = Math.floor(Math.random() * 10) + 1; // 1 a 10
        captchaSum = num1 + num2;
        document.getElementById('captchaQuestion').textContent = `${num1} + ${num2} = ?`;
        document.getElementById('captchaInput').value = '';
    }

    function performLogin() {
        const u = loginUser.value.toLowerCase().trim();
        const p = loginPass.value.trim();
        const c = parseInt(document.getElementById('captchaInput').value);

        // 1. Verificar Captcha
        if (isNaN(c) || c !== captchaSum) {
            loginError.textContent = "⛔ ERROR DE SUMA (CAPTCHA INCORRECTO)";
            loginError.style.display = "block";
            initCaptcha(); // Cambiar números para evitar spam
            shakeBox();
            return;
        }

        // 2. Verificar Credenciales
        if (USERS[u] && USERS[u].pass === p) {
            // ÉXITO
            currentUser = USERS[u];
            loginTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
            
            loginOverlay.style.display = "none";
            appContent.style.display = "block";
            userDisplay.textContent = currentUser.name;
            
            // Auto-select agente
            const agenteSelect = document.getElementById('agente');
            agenteSelect.value = currentUser.name;

            // Permisos Admin
            if (currentUser.role !== "admin") {
                managerSection.style.display = "none";
                document.getElementById('clearHistoryButton').style.display = "none";
            } else {
                managerSection.style.display = "block";
                document.getElementById('clearHistoryButton').style.display = "block";
            }
            
            renderStatusPanel();
            startMiamiClock();

        } else {
            loginError.textContent = "⛔ USUARIO O CLAVE INCORRECTOS";
            loginError.style.display = "block";
            shakeBox();
        }
    }

    function shakeBox() {
        document.querySelector('.login-box').animate([
            { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, 
            { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
        ], { duration: 300 });
    }

    // --- DASHBOARD FUNCTIONS ---
    function renderStatusPanel() {
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
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            document.getElementById('miamiTime').textContent = timeString;
        }, 1000);
    }

    // --- FORMULARIO & LOGICA ---
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

    tipoInvitacionSelect.addEventListener('change', toggleParejaFields);
    lugarSelect.addEventListener('change', updateHorarios);
    fechaInput.addEventListener('change', updateHorarios);
    generateButton.addEventListener('click', handleGenerate);
    copySheetsButton.addEventListener('click', copyForSheets);

    if(btnWaClient) {
        btnWaClient.addEventListener('click', () => {
            let rawPhone = document.getElementById('telefonoCliente').value;
            let phone = rawPhone.replace(/\D/g, ''); 
            if(phone.length === 10) phone = '1' + phone;
            const message = document.getElementById
