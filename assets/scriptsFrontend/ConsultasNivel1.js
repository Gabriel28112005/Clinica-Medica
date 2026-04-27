'use strict';

verificarAcceso();
if (obtenerNivel() !== 1) window.location.href = '/';

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

async function cargarCitasPorMedico() {
    try {
        const datos = await peticion('GET', '/api/consultas/citas-por-medico');
        const tbody = document.getElementById('tablaCitasMedico');
        tbody.innerHTML = datos.map(d => `
            <tr>
                <td>${d.nombreMedico}</td>
                <td>${d.totalCitas}</td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCitasPorEstado() {
    try {
        const datos = await peticion('GET', '/api/consultas/citas-por-estado');
        const tbody = document.getElementById('tablaCitasEstado');
        tbody.innerHTML = datos.map(d => `
            <tr>
                <td>${d.estado}</td>
                <td>${d.total}</td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarMedicoMasPacientes() {
    try {
        const datos = await peticion('GET', '/api/consultas/medico-mas-pacientes');
        const tbody = document.getElementById('tablaMedicoPacientes');
        tbody.innerHTML = datos.map(d => `
            <tr>
                <td>${d.nombreMedico}</td>
                <td>${d.totalPacientes}</td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarPruebaMasRealizada() {
    try {
        const datos = await peticion('GET', '/api/consultas/prueba-mas-realizada');
        const tbody = document.getElementById('tablaPruebaMasRealizada');
        tbody.innerHTML = datos.map(d => `
            <tr>
                <td>${d.nombrePrueba}</td>
                <td>${d.totalVeces}</td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarPacientesMasCitas() {
    try {
        const datos = await peticion('GET', '/api/consultas/pacientes-mas-citas');
        const tbody = document.getElementById('tablaPacientesMasCitas');
        tbody.innerHTML = datos.map(d => `
            <tr>
                <td>${d.nombrePaciente}</td>
                <td>${d.totalCitas}</td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

cargarCitasPorMedico();
cargarCitasPorEstado();
cargarMedicoMasPacientes();
cargarPruebaMasRealizada();
cargarPacientesMasCitas();