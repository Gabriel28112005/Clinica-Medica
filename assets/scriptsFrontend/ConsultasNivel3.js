'use strict';

verificarAcceso();
if (obtenerNivel() !== 3) window.location.href = '/';

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

function filaVacia(colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center;color:#9ca3af;padding:1.5rem">No se encontraron resultados.</td></tr>`;
}

function badgeEstado(estado) {
    const clases = {
        'Pendiente':  'badge-estado badge-pendiente',
        'Completada': 'badge-estado badge-completada',
        'Cancelada':  'badge-estado badge-cancelada'
    };
    return `<span class="${clases[estado] || 'badge-estado'}">${estado}</span>`;
}

// ============================================================
// LISTADO DE PACIENTES CON BÚSQUEDA INTEGRADA
// ============================================================

let todosPacientes = [];

async function cargarListadoPacientes() {
    try {
        todosPacientes = await peticion('GET', '/api/consultas/listado-pacientes');
        renderizarPacientes(todosPacientes);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarPacientes(datos) {
    const tbody = document.getElementById('tablaListadoPacientes');
    tbody.innerHTML = datos.length === 0 ? filaVacia(3) : datos.map(d => `
        <tr>
            <td>${d.idPaciente}</td>
            <td>${d.nombrePaciente}</td>
            <td>${d.telefonoPaciente}</td>
        </tr>`).join('');
}

function aplicarFiltroPacientes() {
    const termino = document.getElementById('inputBuscarPaciente').value.trim().toLowerCase();
    if (!termino) {
        renderizarPacientes(todosPacientes);
        return;
    }
    renderizarPacientes(todosPacientes.filter(p =>
        p.nombrePaciente.toLowerCase().includes(termino)
    ));
}

document.getElementById('inputBuscarPaciente').addEventListener('input', aplicarFiltroPacientes);
document.getElementById('inputBuscarPaciente').addEventListener('keydown', e => {
    if (e.key === 'Enter') aplicarFiltroPacientes();
});

// ============================================================
// LISTADO DE MÉDICOS CON BÚSQUEDA Y FILTRO POR ESPECIALIDAD
// ============================================================

let todosMedicos = [];

async function cargarListadoMedicos() {
    try {
        todosMedicos = await peticion('GET', '/api/consultas/listado-medicos');
        renderizarMedicos(todosMedicos);

        const especialidades = await peticion('GET', '/api/especialidades');
        const select = document.getElementById('inputFiltroEspecialidad');
        especialidades.forEach(e => {
            const option       = document.createElement('option');
            option.value       = e.nombreEspecialidad;
            option.textContent = e.nombreEspecialidad;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarMedicos(datos) {
    const tbody = document.getElementById('tablaListadoMedicos');
    tbody.innerHTML = datos.length === 0 ? filaVacia(4) : datos.map(d => `
        <tr>
            <td>${d.idMedico}</td>
            <td>${d.nombreMedico}</td>
            <td>${d.telefonoMedico}</td>
            <td>${d.especialidades || '-'}</td>
        </tr>`).join('');
}

function aplicarFiltroMedicos() {
    const termino      = document.getElementById('inputBuscarMedico').value.trim().toLowerCase();
    const especialidad = document.getElementById('inputFiltroEspecialidad').value.toLowerCase();

    let resultado = todosMedicos;

    if (termino) {
        resultado = resultado.filter(m =>
            m.nombreMedico.toLowerCase().includes(termino)
        );
    }

    if (especialidad) {
        resultado = resultado.filter(m =>
            (m.especialidades || '').toLowerCase().includes(especialidad)
        );
    }

    renderizarMedicos(resultado);
}

document.getElementById('inputBuscarMedico').addEventListener('input', aplicarFiltroMedicos);
document.getElementById('inputBuscarMedico').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroMedicos(); });
document.getElementById('inputFiltroEspecialidad').addEventListener('change', aplicarFiltroMedicos);

// ============================================================
// CITAS DE UN PACIENTE
// ============================================================

function renderizarCitasPaciente(datos) {
    const tbody = document.getElementById('tablaCitasPaciente');
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

async function cargarTodasCitasPaciente() {
    try {
        const datos = await peticion('GET', '/api/citas');
        renderizarCitasPaciente(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function buscarCitasPaciente() {
    const paciente = document.getElementById('inputNombrePacienteCitas').value.trim();
    const medico   = document.getElementById('inputNombreMedicoCitas').value.trim();
    const estado   = document.getElementById('inputEstadoCitas').value;

    if (!paciente && !medico && !estado) {
        cargarTodasCitasPaciente();
        return;
    }

    try {
        const params = new URLSearchParams();
        if (paciente) params.append('paciente', paciente);
        if (medico)   params.append('medico',   medico);
        if (estado)   params.append('estado',   estado);
        const datos = await peticion('GET', `/api/consultas/buscar-citas?${params.toString()}`);
        renderizarCitasPaciente(datos);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('botonBuscarCitasPaciente').addEventListener('click', buscarCitasPaciente);
document.getElementById('inputNombrePacienteCitas').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCitasPaciente(); });
document.getElementById('inputNombreMedicoCitas').addEventListener('keydown',   e => { if (e.key === 'Enter') buscarCitasPaciente(); });
document.getElementById('inputNombrePacienteCitas').addEventListener('input', buscarCitasPaciente);
document.getElementById('inputNombreMedicoCitas').addEventListener('input',   buscarCitasPaciente);
document.getElementById('inputEstadoCitas').addEventListener('change', buscarCitasPaciente);

// ============================================================
// INICIALIZACIÓN
// ============================================================

cargarListadoPacientes();
cargarListadoMedicos();
cargarTodasCitasPaciente();