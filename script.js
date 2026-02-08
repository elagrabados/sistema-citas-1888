// ===============================================
// ARCHIVO: script.js (Versión v8.0 - Control Total)
// ===============================================

// --- USUARIOS Y CLAVES ACTUALIZADAS ---
const USERS = {
    "isabela":  { pass: "admin2026",  name: "Isabella Ramos", role: "admin" },
    "paula":    { pass: "citas2026*", name: "Paula González", role: "admin" }, // Paula ahora es Admin
    "patricia": { pass: "citas2026*", name: "Patricia Bustos", role: "agente" },
    "ana":      { pass: "citas2026*", name: "Ana Chacon",     role: "agente" },
    "andrea":   { pass: "citas2026*", name: "Andrea Venegas", role: "agente" }
};

let currentUser = null;
let loginTime = null;

document.addEventListener('DOMContentLoaded', () => {
    // DATOS
    const venueData = {
        "Icon Park Orlando": { address: "8375 International Drive, Orlando, FL 32819 Suite 50", schedules: { weekday: ["11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"], weekend: ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"] }},
        "Vista Cay Resort": { address: "9650 Universal Blvd, Suite 120 Orlando, FL 32819", schedules: { any: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] }},
        "Newport Beachside Resort": { address: "16701 Collins Ave, Sunny Isles Beach, FL 33160\nHotel Newport Beachside Resort", schedules: { weekday: ["9:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"], weekend: ["8:15 AM", "10:00 AM", "12:15 PM", "2:00 PM", "3:00 PM", "4:00 PM"] }}
    };
    
    const managerInfo = { name: "Isabella Ramos", phone: "(786) 5487-7819" };

    // ELEMENTOS
    const loginOverlay = document.getElementById('loginOverlay');
    const appContent = document.getElementById('appContent');
    const btnLogin = document.getElementById('btnLogin');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const loginError = document.getElementById('loginError');
    const managerSection = document.getElementById('managerSection');
    const userDisplay = document.getElementById('userDisplay');
    const agentsGrid = document.getElementById('agentsGrid');
    
    // LOGIN
    btnLogin.addEventListener('click', performLogin);
    loginPass.addEventListener('keypress', (e) => { if(e.key === 'Enter') performLogin(); });

    function performLogin() {
        const u = loginUser.value.toLowerCase().trim();
        const p = loginPass.value.trim();

        if (USERS[u] && USERS[u].pass === p) {
            currentUser = USERS[u];
            // Hora de Miami para el registro de entrada
            loginTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
            
            loginOverlay.style.display = "none";
            appContent.style.display = "block";
            userDisplay.textContent = currentUser.name;
            
            // Auto-select agente
            const agenteSelect = document.getElementById('agente');
            agenteSelect.value = currentUser.name;

            // Permisos Admin (Isabela y Paula)
            if (currentUser.role !== "admin") {
                managerSection.style.display = "none";
                document.getElementById('clearHistoryButton').style.display = "none";
            } else {
                managerSection.style.display = "block";
                document.getElementById('clearHistoryButton').style.display = "block";
            }
            
            // Iniciar Panel de Control
            renderStatusPanel();
            startMiamiClock();

        } else {
            loginError.style.display = "block";
            // Efecto de temblor
            document.querySelector('.login-box').animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    }

    // --- PANEL DE CONTROL "GRAN HERMANO" ---
    function renderStatusPanel() {
        agentsGrid.innerHTML = '';
        
        // Recorremos todos los usuarios definidos
        Object.keys(USERS).forEach(key => {
            const user = USERS[key];
            const isMe = (user.name === currentUser.name);
            
            const div = document.createElement('div');
            div.className = 'agent-status';
            
            // Lógica de luces: YO estoy verde, las otras Rojas (para simular control de asistencia)
            const statusClass = isMe ? 'online' : '';
            const statusText = isMe ? `ENTRADA: ${loginTime}` : 'OFFLINE';
            
            // Nombre corto (Primer nombre)
            const shortName = user.name.split(' ')[0];

            div.innerHTML = `
                <div class="status-light ${statusClass}"></div>
                <span>${shortName}</span>
                <span style="font-size:0.7em; opacity:0.7; margin-left:5px;">${statusText}</span>
            `;
            agentsGrid.appendChild(div);
        });
    }

    function startMiamiClock() {
        const clockElement = document.getElementById('miamiTime');
        setInterval(() => {
            const now = new Date();
            // Forzar zona horaria Miami (New York)
            const timeString = now.toLocaleTimeString('en-US', { 
                timeZone: 'America/New_York',
                hour12: true,
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            clockElement.textContent = timeString;
        }, 1000);
    }

    // --- LOGICA DEL FORMULARIO ---
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

    // Botón WhatsApp
    if(btnWaClient) {
        btnWaClient.addEventListener('click', () => {
            let rawPhone = document.getElementById('telefonoCliente').value;
            let phone = rawPhone.replace(/\D/g, ''); 
            if(phone.length === 10) phone = '1' + phone;
            
            const message = document.getElementById('confirmationOutput').value;
            if(!phone) { alert("Número inválido"); return; }
            
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    }
    
    // Limpiar Historial
    if(clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            if(confirm("CONFIRMAR: ¿Borrar base de datos completa?")) {
                if(typeof clearHistoryDB === 'function') clearHistoryDB();
            }
        });
    }

    // Buscador
    if(historySearchInput) {
        historySearchInput.addEventListener('input', () => {
            if(typeof localHistory !== 'undefined') renderHistory(localHistory); 
        });
    }
    
    document.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', (e) => copyText(e.target.dataset.target, e.target));
    });

    toggleParejaFields();
    updateHorarios();
    if(typeof listenToHistory === 'function') listenToHistory(renderHistory);

    // --- FUNCIONES INTERNAS ---
    function toggleParejaFields() {
        const esPareja = tipoInvitacionSelect.value === 'pareja';
        const fields = document.querySelectorAll('.invitado2-field');
        fields.forEach(f => f.style.display = esPareja ? 'block' : 'none');
        document.getElementById('invitado2').required = esPareja;
    }

    function handleGenerate() {
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const data = collectData();
        generateMessages(data);
        if(typeof addAppointmentToHistory === 'function') addAppointmentToHistory(data);
        
        outputContainer.classList.remove('hidden');
        if(currentUser && currentUser.role !== "admin") {
            managerSection.style.display = "none";
        }
        window.scrollTo({ top: outputContainer.offsetTop - 20, behavior: 'smooth' });
    }

    function collectData() {
        let phoneInput = document.getElementById('telefonoCliente');
        let cleanPhone = phoneInput.value.replace(/\D/g, ''); 
        if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
            cleanPhone = cleanPhone.substring(1); 
            phoneInput.value = cleanPhone; 
        }

        let emailInput = document.getElementById('emailCliente');
        let emailVal = emailInput.value.trim();
        if (emailVal === "") {
            const nombreRaw = document.getElementById('invitado1').value || "invitado";
            const nombreLimpio = nombreRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
            const numeros = Math.floor(Math.random() * 90 + 10);
            const dominio = Math.random() > 0.5 ? "gmail.com" : "hotmail.com";
            emailVal = `${nombreLimpio}${numeros}@${dominio}`;
            emailInput.value = emailVal;
        }
        
        return {
            fuente: document.getElementById('fuenteLead').value,
            agente: document.getElementById('agente').value,
            invitado1: document.getElementById('invitado1').value,
            edad1: document.getElementById('edad1').value,
            invitado2: document.getElementById('invitado2').value,
            edad2: document.getElementById('edad2').value,
            telefono: cleanPhone,
            email: emailVal,
            lugar: lugarSelect.value,
            fecha: fechaInput.value,
            hora: horaSelect.value,
            destino: document.getElementById('destinoRegalo').value,
            ofertaTexto: document.getElementById('oferta').value,
            notas: document.getElementById('notasInternas').value,
            tipoInvitacion: tipoInvitacionSelect.value,
            generated: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})
        };
    }

    function generateMessages(data) {
        const dateObj = new Date(data.fecha + 'T12:00:00Z');
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const fechaTexto = `${dias[dateObj.getUTCDay()]} ${dateObj.getUTCDate()} de ${meses[dateObj.getUTCMonth()]}`;
        const prevDay = new Date(dateObj);
        prevDay.setUTCDate(prevDay.getUTCDate() - 1);
        const prevDayTxt = dias[prevDay.getUTCDay()];
        const esPareja = data.tipoInvitacion === 'pareja';
        const tratamiento = data.invitado1.split(' ')[0] || '';
        const nombreSolo = data.invitado1.split(' ').slice(1).join(' ') || data.invitado1;

        let msg1 = `CITA REGISTRADA - 1888 Hoteles\nAGENTE: ${data.agente}\n`;
        msg1 += esPareja ? `Invitados: ${data.invitado1} y ${data.invitado2}\n` : `Invitada: ${data.invitado1}\n`;
        msg1 += `Evento día: ${fechaTexto}\nHORA: ${data.hora}\n\nSUS VACACIONES DE CORTESÍA INCLUYE:\n\n${data.ofertaTexto}`;

        let msg2 = `Dirección para retirar las vacaciones: ${venueData[data.lugar].address}`;

        let msg3 = `IMPORTANTE REQUISITOS PARA RETIRAR SUS PREMIOS SIN INCONVENIENTES\n\n`;
        msg3 += esPareja 
            ? `📇 1- Deben asistir juntos con sus IDs o Licencia Vigentes.\n`
            : `📇 1- Debes asistir junto con su ID o Licencia Vigente.\n`;
        msg3 += `💳 2- Mostrar una tarjeta de crédito (NO DÉBITO). No debe pagar nada. Requisito protocolar para check-in.\n`;
        msg3 += `🕑 3- El evento dura 90 a 120 minutos, sin ningún compromiso de compra.\n`;
        if (esPareja) msg3 += `👨‍👩‍👦 4- Deben tener la misma dirección en los Ids o Prueba de convivencia.\n`;
        msg3 += `📲 ${esPareja ? 5 : 4}- Responder el mensaje de confirmación de mi manager ${managerInfo.name} (${managerInfo.phone}), que le enviara el ${prevDayTxt} para generar su código de parqueo.\n\n`;
        msg3 += `Por favor ${tratamiento} ${nombreSolo} lea bien los requisitos y me confirma si todo está claro.`;

        const lugarClean = data.lugar === "Newport Beachside Resort" ? "Newport Beach Resort" : data.lugar;
        let msgConf = `¡Hola! ${data.invitado1} mi nombre es ${managerInfo.name} la persona que verifica las citas.\n`;
        msgConf += `Este texto es para confirmar su cita de mañana a las ${data.hora}, según su conversación con ${data.agente} vienes a retirar:\n\n`;
        msgConf += `Vacaciones de cortesía:\n\n${data.ofertaTexto}\n\n`; 
        msgConf += `Nuestra dirección exacta: ${lugarClean}: ${venueData[data.lugar].address}.\n\n`;
        msgConf += `Por favor me confirma su asistencia con un "SI" para poderla recibir en el Lobby del Hotel.`;

        document.getElementById('whatsappOutput1').value = msg1;
        document.getElementById('whatsappOutput2').value = msg2;
        document.getElementById('whatsappOutput3').value = msg3;
        document.getElementById('confirmationOutput').value = msgConf;
    }

    function copyForSheets() {
        const d = collectData();
        const today = new Date().toISOString().split('T')[0];
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const evtDate = new Date(d.fecha + 'T12:00:00Z');
        const diaSemana = dias[evtDate.getUTCDay()];
        const maritalStatus = d.tipoInvitacion === 'pareja' ? 'Casado/Union' : 'Soltera';
        const row = [d.fuente, d.agente, "", d.lugar, d.notas, today, d.fecha, diaSemana, d.hora, "", d.invitado1, d.edad1, d.invitado2, d.edad2, d.telefono, d.email, maritalStatus, "", d.destino].join('\t');
        navigator.clipboard.writeText(row).then(() => {
            const btn = document.getElementById('copySheetsButton');
            const original = btn.textContent;
            btn.textContent = "✅ ¡COPIADO!";
            btn.style.backgroundColor = "#054b25";
            setTimeout(() => { btn.textContent = original; btn.style.backgroundColor = "#10b981"; }, 2000);
        });
    }

    function updateHorarios() {
        const lugar = lugarSelect.value;
        const fecha = fechaInput.value;
        horaSelect.innerHTML = '<option value="">--</option>';
        if (!lugar || !fecha) return;
        const dateObj = new Date(fecha + 'T12:00:00Z');
        const day = dateObj.getUTCDay();
        const venue = venueData[lugar];
        let horarios = venue.schedules.any || [];
        if (!horarios.length) {
            const isWeekend = (day === 0 || day === 6);
            const isFriIcon = lugar.includes("Icon") && day === 5;
            horarios = (isWeekend || isFriIcon) ? venue.schedules.weekend : venue.schedules.weekday;
        }
        horarios.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h; opt.textContent = h; horaSelect.appendChild(opt);
        });
    }

    function copyText(id, btn) {
        const el = document.getElementById(id);
        el.select();
        document.execCommand('copy');
        const original = btn.textContent;
        btn.textContent = "¡Listo!";
        setTimeout(() => btn.textContent = original, 1500);
    }
    
    function renderHistory(data) {
        const container = document.getElementById('historyTableBody');
        const searchTerm = document.getElementById('historySearchInput') ? document.getElementById('historySearchInput').value.toLowerCase().trim() : '';
        if(!container) return;
        container.innerHTML = '';
        if(!data) { container.innerHTML = '<div>Sin datos</div>'; return; }
        let historyKeys = Object.keys(data).reverse();
        if (searchTerm) {
            historyKeys = historyKeys.filter(key => {
                const entry = data[key];
                const telLimpio = entry.telefono ? entry.telefono.replace(/\D/g, '') : '';
                return telLimpio.includes(searchTerm.replace(/\D/g, ''));
            });
        }
        historyKeys.slice(0, 20).forEach(key => {
            const cita = data[key];
            const div = document.createElement('div');
            div.style.padding = "10px"; div.style.borderBottom="1px solid #eee";
            div.innerHTML = `<strong>${cita.invitado1}</strong> - ${cita.fecha}<br><small>${cita.agente}</small> <button class="regenerate-btn" data-key="${key}" style="float:right">Ver</button>`;
            div.querySelector('.regenerate-btn').addEventListener('click', () => {
                generateMessages(cita);
                outputContainer.classList.remove('hidden');
                if(currentUser && currentUser.role !== "admin") managerSection.style.display = "none";
                else managerSection.style.display = "block";
                window.scrollTo({ top: outputContainer.offsetTop - 20, behavior: 'smooth' });
            });
            container.appendChild(div);
        });
    }
});
