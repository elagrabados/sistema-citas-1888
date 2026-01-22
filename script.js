// ===============================================
// ARCHIVO: script.js (Versión v5.0 Sheets Ready)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // DATOS DE SEDES
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
    const managerInfo = { name: "Isabella Ramos", phone: "(786) 529-6426" };

    // ELEMENTOS
    const form = document.getElementById('citaForm');
    const generateButton = document.getElementById('generateButton');
    const copySheetsButton = document.getElementById('copySheetsButton');
    const outputContainer = document.getElementById('outputContainer');
    const tipoInvitacionSelect = document.getElementById('tipoInvitacion');
    const lugarSelect = document.getElementById('lugar');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    
    // LISTENERS
    tipoInvitacionSelect.addEventListener('change', toggleParejaFields);
    lugarSelect.addEventListener('change', updateHorarios);
    fechaInput.addEventListener('change', updateHorarios);
    generateButton.addEventListener('click', handleGenerate);
    copySheetsButton.addEventListener('click', copyForSheets);
    
    document.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', (e) => copyText(e.target.dataset.target, e.target));
    });

    // INICIO
    toggleParejaFields();
    updateHorarios();
    if(typeof listenToHistory === 'function') listenToHistory(renderHistory);


    // --- FUNCIONES ---

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
        
        // Guardar en la Nube (database.js)
        if(typeof addAppointmentToHistory === 'function') {
            addAppointmentToHistory(data);
        }

        outputContainer.classList.remove('hidden');
        window.scrollTo({ top: outputContainer.offsetTop - 20, behavior: 'smooth' });
    }

    function collectData() {
        return {
            fuente: document.getElementById('fuenteLead').value,
            agente: document.getElementById('agente').value,
            invitado1: document.getElementById('invitado1').value,
            edad1: document.getElementById('edad1').value,
            invitado2: document.getElementById('invitado2').value,
            edad2: document.getElementById('edad2').value,
            telefono: document.getElementById('telefonoCliente').value,
            email: document.getElementById('emailCliente').value,
            lugar: lugarSelect.value,
            fecha: fechaInput.value,
            hora: horaSelect.value,
            destino: document.getElementById('destinoRegalo').value,
            ofertaTexto: document.getElementById('oferta').value,
            notas: document.getElementById('notasInternas').value,
            tipoInvitacion: tipoInvitacionSelect.value,
            generated: new Date().toLocaleString('es-ES')
        };
    }

    function generateMessages(data) {
        // Preparar variables de fecha
        const dateObj = new Date(data.fecha + 'T12:00:00Z');
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const fechaTexto = `${dias[dateObj.getUTCDay()]} ${dateObj.getUTCDate()} de ${meses[dateObj.getUTCMonth()]}`;
        
        // Calcular dia anterior para confirmacion
        const prevDay = new Date(dateObj);
        prevDay.setUTCDate(prevDay.getUTCDate() - 1);
        const prevDayTxt = dias[prevDay.getUTCDay()];

        const esPareja = data.tipoInvitacion === 'pareja';
        const tratamiento = data.invitado1.split(' ')[0] || '';
        const nombreSolo = data.invitado1.split(' ').slice(1).join(' ') || data.invitado1;

        // 1. Mensaje Oferta
        let msg1 = `CITA REGISTRADA - 1888 Hoteles\nAGENTE: ${data.agente}\n`;
        msg1 += esPareja ? `Invitados: ${data.invitado1} y ${data.invitado2}\n` : `Invitada: ${data.invitado1}\n`;
        msg1 += `Evento día: ${fechaTexto}\nHORA: ${data.hora}\n\nSUS VACACIONES DE CORTESÍA INCLUYE:\n\n${data.ofertaTexto}`;

        // 2. Mensaje Dirección
        let msg2 = `Dirección para retirar las vacaciones: ${venueData[data.lugar].address}`;

        // 3. Mensaje Requisitos
        let msg3 = `IMPORTANTE REQUISITOS PARA RETIRAR SUS PREMIOS SIN INCONVENIENTES\n\n`;
        msg3 += esPareja 
            ? `📇 1- Deben asistir juntos con sus IDs o Licencia Vigentes.\n`
            : `📇 1- Debes asistir junto con su ID o Licencia Vigente.\n`;
        msg3 += `💳 2- Mostrar una tarjeta de crédito (NO DÉBITO). No debe pagar nada. Requisito protocolar para check-in.\n`;
        msg3 += `🕑 3- El evento dura 90 a 120 minutos, sin ningún compromiso de compra.\n`;
        if (esPareja) msg3 += `👨‍👩‍👦 4- Deben tener la misma dirección en los Ids o Prueba de convivencia.\n`;
        msg3 += `📲 ${esPareja ? 5 : 4}- Responder el mensaje de confirmación de mi manager ${managerInfo.name} (${managerInfo.phone}), que le enviara el ${prevDayTxt} para generar su código de parqueo.\n\n`;
        msg3 += `Por favor ${tratamiento} ${nombreSolo} lea bien los requisitos y me confirma si todo está claro.`;

        // 4. Confirmación Manager
        const lugarClean = data.lugar === "Newport Beachside Resort" ? "Newport Beach Resort" : data.lugar;
        let msgConf = `¡Hola! ${data.invitado1} mi nombre es ${managerInfo.name} la persona que verifica las citas.\n`;
        msgConf += `Este texto es para confirmar su cita de mañana a las ${data.hora}, según su conversación con ${data.agente} vienes a retirar:\n\n`;
        msgConf += `Vacaciones de cortesía: ${data.destino} y beneficios adicionales.\n\n`;
        msgConf += `Nuestra dirección exacta: ${lugarClean}: ${venueData[data.lugar].address}.\n\n`;
        msgConf += `Por favor me confirma su asistencia con un "SI" para poderla recibir en el lobby.`;

        document.getElementById('whatsappOutput1').value = msg1;
        document.getElementById('whatsappOutput2').value = msg2;
        document.getElementById('whatsappOutput3').value = msg3;
        document.getElementById('confirmationOutput').value = msgConf;
    }

    // --- FUNCIÓN CLAVE: COPIAR A GOOGLE SHEETS ---
    function copyForSheets() {
        const d = collectData();
        
        // 1. Calcular Fecha Creación (HOY) formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // 2. Calcular Día de la Semana del Evento
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const evtDate = new Date(d.fecha + 'T12:00:00Z');
        const diaSemana = dias[evtDate.getUTCDay()];

        // 3. Status Marital (Mapeo de Q)
        const maritalStatus = d.tipoInvitacion === 'pareja' ? 'Casado/Union' : 'Soltera';

        // CONSTRUCCIÓN DE LA FILA (ORDEN A - S)
        // \t significa "Tabulador" (salta a la siguiente columna)
        const row = [
            d.fuente,           // A- Fuente Lead
            d.agente,           // B- Agente
            "",                 // C- Status (Vacio)
            d.lugar,            // D- Lugar
            d.notas,            // E- Comentarios
            today,              // F- Fecha Creación
            d.fecha,            // G- Appt Date
            diaSemana,          // H- Dia
            d.hora,             // I- Time
            "",                 // J- Tour ID (Vacio)
            d.invitado1,        // K- Nombre 1
            d.edad1,            // L- Edad 1
            d.invitado2,        // M- Nombre 2
            d.edad2,            // N- Edad 2
            d.telefono,         // O- Telefono
            d.email,            // P- Email
            maritalStatus,      // Q- Marital Status
            "",                 // R- (Columna R vacía en tu lista, asumo espacio)
            d.destino           // S- Destino
        ].join('\t');

        // Copiar al portapapeles
        navigator.clipboard.writeText(row).then(() => {
            const btn = document.getElementById('copySheetsButton');
            const originalText = btn.textContent;
            btn.textContent = "✅ ¡COPIADO! PEGA EN SHEETS";
            btn.style.backgroundColor = "#054b25";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = "#107c41";
            }, 2000);
        }).catch(err => alert("Error al copiar: " + err));
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
            opt.value = h;
            opt.textContent = h;
            horaSelect.appendChild(opt);
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
        // Lógica simple para mostrar historial si lo deseas
        const container = document.getElementById('historyTableBody');
        if(!container) return;
        container.innerHTML = '';
        if(!data) return;
        
        Object.values(data).reverse().slice(0, 10).forEach(cita => {
            const div = document.createElement('div');
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #eee";
            div.textContent = `${cita.generated} - ${cita.invitado1} (${cita.lugar})`;
            container.appendChild(div);
        });
    }
});