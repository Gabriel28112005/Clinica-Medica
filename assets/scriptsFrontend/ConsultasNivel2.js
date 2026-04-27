'use strict';

verificarAcceso();
if (obtenerNivel() !== 2) window.location.href = '/';

document.getElementById('botonCerrarSesion').addEventListener('click', cerrarSesion);

const nombreUsuario = JSON.parse(atob(obtenerToken().split('.')[1])).nombreUsuario;
document.getElementById('nombreUsuarioHeader').textContent = nombreUsuario;
document.getElementById('nombreBienvenida').textContent    = nombreUsuario;

// Pestañas
document.querySelectorAll('.pestana').forEach(pestana => {
    pestana.addEventListener('click', () => {
        document.querySelectorAll('.pestana').forEach(p => p.classList.remove('activa'));
        document.querySelectorAll('.panel-pestana').forEach(p => p.classList.remove('activo'));
        pestana.classList.add('activa');
        document.getElementById(`panel-${pestana.dataset.pestana}`).classList.add('activo');
    });
});

// ============================================================
// UTILIDADES
// ============================================================

function badgeEstado(estado) {
    const clases = {
        'Pendiente':  'badge-estado badge-pendiente',
        'Completada': 'badge-estado badge-completada',
        'Cancelada':  'badge-estado badge-cancelada'
    };
    return `<span class="${clases[estado] || 'badge-estado'}">${estado}</span>`;
}

function filaVacia(colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center;color:#9ca3af;padding:1.5rem">No se encontraron resultados.</td></tr>`;
}

// ============================================================
// CARGAR MÉDICOS EN EL SELECT
// ============================================================

async function cargarMedicosSelect() {
    try {
        const medicos = await peticion('GET', '/api/medicos');
        const select  = document.getElementById('inputMedicoFiltro');
        select.innerHTML = '<option value="">Todos</option>';
        medicos.forEach(m => {
            const option       = document.createElement('option');
            option.value       = m.idMedico;
            option.textContent = m.nombreMedico;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

// ============================================================
// CITAS POR RANGO DE FECHAS
// ============================================================

function renderizarCitasFechas(datos) {
    const tbody = document.getElementById('tablaCitasFechas');
    tbody.innerHTML = datos.length === 0 ? filaVacia(6) : datos.map(d => `
        <tr>
            <td>${d.idCita}</td>
            <td>${new Date(d.fechaIngreso).toLocaleString('es-ES')}</td>
            <td>${badgeEstado(d.estado)}</td>
            <td>${d.nombrePaciente}</td>
            <td>${d.nombreMedico}</td>
            <td>${d.diagnostico || '-'}</td>
        </tr>`).join('');
}

async function cargarTodasCitasFechas() {
    try {
        const datos = await peticion('GET', '/api/citas');
        renderizarCitasFechas(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function buscarCitasPorFechas() {
    const desde = document.getElementById('inputDesde').value;
    const hasta = document.getElementById('inputHasta').value;
    if (!desde || !hasta) return;
    try {
        const desdeFormateado = desde + ' 00:00:00';
        const hastaFormateado = hasta + ' 23:59:59';
        const datos = await peticion('GET', `/api/consultas/citas-por-fechas?desde=${encodeURIComponent(desdeFormateado)}&hasta=${encodeURIComponent(hastaFormateado)}`);
        renderizarCitasFechas(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('botonBuscarFechas').addEventListener('click', buscarCitasPorFechas);
document.getElementById('inputDesde').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCitasPorFechas(); });
document.getElementById('inputHasta').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCitasPorFechas(); });

// ============================================================
// CITAS POR ESTADO Y MÉDICO
// ============================================================

function renderizarCitasFiltros(datos) {
    const tbody = document.getElementById('tablaCitasFiltros');
    tbody.innerHTML = datos.length === 0 ? filaVacia(6) : datos.map(d => `
        <tr>
            <td>${d.idCita}</td>
            <td>${new Date(d.fechaIngreso).toLocaleString('es-ES')}</td>
            <td>${badgeEstado(d.estado)}</td>
            <td>${d.nombrePaciente}</td>
            <td>${d.nombreMedico}</td>
            <td>${d.diagnostico || '-'}</td>
        </tr>`).join('');
}

async function cargarTodasCitasFiltros() {
    try {
        const datos = await peticion('GET', '/api/citas');
        renderizarCitasFiltros(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function buscarCitasPorFiltros() {
    const estado   = document.getElementById('inputEstadoFiltro').value;
    const idMedico = document.getElementById('inputMedicoFiltro').value;
    try {
        const params = new URLSearchParams();
        if (estado)   params.append('estado',   estado);
        if (idMedico) params.append('idMedico', idMedico);
        const datos = await peticion('GET', `/api/consultas/citas-por-estado-medico?${params.toString()}`);
        renderizarCitasFiltros(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('botonBuscarFiltros').addEventListener('click', buscarCitasPorFiltros);
document.getElementById('inputEstadoFiltro').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCitasPorFiltros(); });
document.getElementById('inputMedicoFiltro').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCitasPorFiltros(); });

// ============================================================
// TRATAMIENTOS POR MEDICAMENTO
// ============================================================

function renderizarTratamientos(datos) {
    const tbody = document.getElementById('tablaTratamientosMedicamento');
    tbody.innerHTML = datos.length === 0 ? filaVacia(5) : datos.map(d => `
        <tr>
            <td>${d.idTratamiento}</td>
            <td>${d.medicamento}</td>
            <td>${d.dosis}</td>
            <td>${d.recomendacion || '-'}</td>
            <td>${d.nombrePaciente}</td>
        </tr>`).join('');
}

async function cargarTodosTratamientos() {
    try {
        const datos = await peticion('GET', '/api/tratamientos');
        renderizarTratamientos(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function buscarTratamientosPorMedicamento() {
    const medicamento = document.getElementById('inputMedicamentoFiltro').value.trim();
    if (!medicamento) {
        cargarTodosTratamientos();
        return;
    }
    try {
        const datos = await peticion('GET', `/api/consultas/tratamientos-por-medicamento?medicamento=${encodeURIComponent(medicamento)}`);
        renderizarTratamientos(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('botonBuscarMedicamento').addEventListener('click', buscarTratamientosPorMedicamento);
document.getElementById('inputMedicamentoFiltro').addEventListener('keydown', e => { if (e.key === 'Enter') buscarTratamientosPorMedicamento(); });
document.getElementById('inputMedicamentoFiltro').addEventListener('input', buscarTratamientosPorMedicamento);

// ============================================================
// PRUEBAS POR TIPO Y FECHA
// ============================================================

function renderizarPruebas(datos) {
    const tbody = document.getElementById('tablaPruebasFiltros');
    tbody.innerHTML = datos.length === 0 ? filaVacia(5) : datos.map(d => `
        <tr>
            <td>${d.idPrueba}</td>
            <td>${d.nombrePrueba}</td>
            <td>${d.resultadoPrueba || '-'}</td>
            <td>${new Date(d.fechaPrueba).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
            <td>${d.nombrePaciente}</td>
        </tr>`).join('');
}

async function cargarTodasPruebas() {
    try {
        const datos = await peticion('GET', '/api/pruebas');
        renderizarPruebas(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function buscarPruebasPorFiltros() {
    const tipo  = document.getElementById('inputTipoPrueba').value.trim();
    const desde = document.getElementById('inputDesdePrueba').value;
    const hasta = document.getElementById('inputHastaPrueba').value;
    try {
        const params = new URLSearchParams();
        if (tipo)  params.append('tipo',  tipo);
        if (desde) params.append('desde', desde);
        if (hasta) params.append('hasta', hasta);
        const datos = await peticion('GET', `/api/consultas/pruebas-por-tipo-fecha?${params.toString()}`);
        renderizarPruebas(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('botonBuscarPruebas').addEventListener('click', buscarPruebasPorFiltros);
document.getElementById('inputTipoPrueba').addEventListener('keydown',  e => { if (e.key === 'Enter') buscarPruebasPorFiltros(); });
document.getElementById('inputDesdePrueba').addEventListener('keydown', e => { if (e.key === 'Enter') buscarPruebasPorFiltros(); });
document.getElementById('inputHastaPrueba').addEventListener('keydown', e => { if (e.key === 'Enter') buscarPruebasPorFiltros(); });
document.getElementById('inputTipoPrueba').addEventListener('input', buscarPruebasPorFiltros);

// ============================================================
// INICIALIZACIÓN
// ============================================================

cargarMedicosSelect();
cargarTodasCitasFechas();
cargarTodasCitasFiltros();
cargarTodosTratamientos();
cargarTodasPruebas();