// ===============================================
// ARCHIVO: script.js (Versión v5.8 - FINAL DE HOY)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS ---
    const venueData = {
        "Icon Park Orlando": { 
            address: "8375 International Drive, Orlando, FL 32819 Suite 50", 
            schedules: { weekday: ["11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"], weekend: ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"] }
        },
        "Vista Cay Resort": { 
            address: "9650 Universal Blvd, Suite 120 Orlando, FL 32819", 
            schedules: { any: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] }
        },
        "Newport Beachside Resort": { 
            address: "16701 Collins Ave, Sunny Isles Beach, FL 33160\nHotel Newport Beachside Resort", 
            schedules: { weekday: ["9:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"], weekend: ["8:15 AM", "10:00 AM", "12:15 PM", "2:00 PM", "3:00 PM", "4:00 PM"] }
        }
    };
    
    // NUEVO TELÉFONO DE ISABELLA
    const managerInfo = { name: "Isabella Ramos", phone: "(786) 5487-7819" };

    // --- ELEMENTOS ---
    const form = document.getElementById('citaForm');
    const generateButton = document.getElementById('generateButton');
    const copySheetsButton = document.getElementById('copySheetsButton');
    const outputContainer = document.getElementById('outputContainer');
    const tipoInvitacionSelect = document.getElementById('tipoInvitacion');
    const lugarSelect = document.getElementById('lugar');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    
    // Controles de Historial
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const historySearchInput = document.getElementById('historySearchInput');
    
    // Botón WhatsApp
    const btnWaClient = document.getElementById('btnWaClient');

    // --- EVENTOS ---
    tipoInvitacionSelect.addEventListener('change', toggleParejaFields);
    lugarSelect.addEventListener('change', updateHorarios);
    fechaInput.addEventListener('change', updateHorarios);
    generateButton.addEventListener('click', handleGenerate);
    copySheetsButton.addEventListener('click', copyForSheets);
    
    // LOGICA BOTÓN WHATSAPP CLIENTE
    if(btnWaClient) {
        btnWaClient.addEventListener('click', () => {
            let rawPhone = document.getElementById('telefonoCliente').value;
            let phone = rawPhone.replace(/\D/g, ''); 
            
            // Si tiene 10 dígitos (USA), agregar 1 para WhatsApp
            if(phone.length === 10) {
                phone = '1' + phone;
            }

            const message = document.getElementById('confirmationOutput').value;

            if(!phone) {
                alert("Por favor ingrese un teléfono válido.");
                return;
            }

            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    }
    
    if(clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            if(confirm("⚠ ¿ESTÁS SEGURO? Esto borrará TODO el historial de la Nube para siempre.")) {
                if(typeof clearHistoryDB === 'function') clearHistoryDB();
            }
        });
    }

    if(historySearchInput) {
        historySearchInput.addEventListener('input', () => {
            if(typeof localHistory !== 'undefined') renderHistory(localHistory); 
        });
    }

    document.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', (e) => copyText(e.target.dataset.target, e.target));
    });

    // --- INICIALIZACIÓN ---
    toggleParejaFields();
    updateHorarios();
    if(typeof listenToHistory === 'function') listenToHistory(renderHistory);

    // --- FUNCIONES LÓGICAS ---
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
        window.scrollTo({ top: outputContainer.offsetTop - 20, behavior: 'smooth' });
    }

    function collectData() {
        // 1. LIMPIEZA INTELIGENTE DE TELÉFONO
        let phoneInput = document.getElementById('telefonoCliente');
        let cleanPhone = phoneInput.value.replace(/\D/g, ''); 
        // Si escribieron 11 dígitos y empieza con 1 (Ej: 1786...), quitamos el 1 inicial
        if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
            cleanPhone = cleanPhone.substring(1); 
            phoneInput.value = cleanPhone; 
        }

        // 2. GENERACIÓN AUTOMÁTICA DE EMAIL (Protocolar)
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
            generated: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
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

        // 1. MENSAJE OFERTA
        let msg1 = `CITA REGISTRADA - 1888 Hoteles\nAGENTE: ${data.agente}\n`;
        msg1 += esPareja ? `Invitados: ${data.invitado1} y ${data.invitado2}\n` : `Invitada: ${data.invitado1}\n`;
        msg1 += `Evento día: ${fechaTexto}\nHORA: ${data.hora}\n\nSUS VACACIONES DE CORTESÍA INCLUYE:\n\n${data.ofertaTexto}`;

        // 2. MENSAJE DIRECCIÓN
        let msg2 = `Dirección para retirar las vacaciones: ${venueData[data.lugar].address}`;

        // 3. MENSAJE REQUISITOS
        let msg3 = `IMPORTANTE REQUISITOS PARA RETIRAR SUS PREMIOS SIN INCONVENIENTES\n\n`;
        msg3 += esPareja 
            ? `📇 1- Deben asistir juntos con sus IDs o Licencia Vigentes.\n`
            : `📇 1- Debes asistir junto con su ID o Licencia Vigente.\n`;
        msg3 += `💳 2- Mostrar una tarjeta de crédito (NO DÉBITO). No debe pagar nada. Requisito protocolar para check-in.\n`;
        msg3 += `🕑 3- El evento dura 90 a 120 minutos, sin ningún compromiso de compra.\n`;
        if (esPareja) msg3 += `👨‍👩‍👦 4- Deben tener la misma dirección en los Ids o Prueba de convivencia.\n`;
        msg3 += `📲 ${esPareja ? 5 : 4}- Responder el mensaje de confirmación de mi manager ${managerInfo.name} (${managerInfo.phone}), que le enviara el ${prevDayTxt} para generar su código de parqueo.\n\n`;
        msg3 += `Por favor ${tratamiento} ${nombreSolo} lea bien los requisitos y me confirma si todo está claro.`;

        // 4. CONFIRMACIÓN MANAGER (COMPLETO)
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

        const row = [
            d.fuente, d.agente, "", d.lugar, d.notas, today, d.fecha, diaSemana, d.hora,
            "", d.invitado1, d.edad1, d.invitado2, d.edad2, d.telefono, d.email, maritalStatus, "", d.destino
        ].join('\t');

        navigator.clipboard.writeText(row).then(() => {
            const btn = document.getElementById('copySheetsButton');
            const original = btn.textContent;
            btn.textContent = "✅ ¡COPIADO!";
            btn.style.backgroundColor = "#054b25";
            setTimeout(() => { btn.textContent = original; btn.style.backgroundColor = "#107c41"; }, 2000);
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
        
        if(!data) {
            container.innerHTML = '<tr><td colspan="7" style="text-align:center">Sin datos</td></tr>';
            return;
        }

        let historyKeys = Object.keys(data).reverse();

        if (searchTerm) {
            historyKeys = historyKeys.filter(key => {
                const entry = data[key];
                const telLimpio = entry.telefono ? entry.telefono.replace(/\D/g, '') : '';
                const busquedaLimpia = searchTerm.replace(/\D/g, '');
                return telLimpio.includes(busquedaLimpia);
            });
        }
        
        if(historyKeys.length === 0) {
            container.innerHTML = '<tr><td colspan="7" style="text-align:center">No hay resultados</td></tr>';
            return;
        }
        
        historyKeys.slice(0, 20).forEach(key => {
            const cita = data[key];
            const row = document.createElement('tr');
            
            const invitadosTxt = (cita.tipoInvitacion === 'pareja' && cita.invitado2) 
                ? `${cita.invitado1}<br><small>y ${cita.invitado2}</small>` 
                : cita.invitado1;

            row.innerHTML = `
                <td data-label="Invitados">${invitadosTxt}</td>
                <td data-label="Teléfono">${cita.telefono}</td>
                <td data-label="Agente">${cita.agente}</td>
                <td data-label="Lugar">${cita.lugar}</td>
                <td data-label="Fecha y Hora">${cita.fecha}<br>${cita.hora}</td>
                <td data-label="Generado">${cita.generated || 'N/A'}</td>
                <td data-label="Acciones">
                    <button class="regenerate-btn" data-key="${key}">Re-Generar</button>
                </td>
            `;
            
            row.querySelector('.regenerate-btn').addEventListener('click', () => {
                generateMessages(cita);
                outputContainer.classList.remove('hidden');
                window.scrollTo({ top: outputContainer.offsetTop - 20, behavior: 'smooth' });
                alert("✅ Datos cargados arriba.");
            });

            container.appendChild(row);
        });
    }
});
