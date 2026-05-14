'use strict';

verificarAcceso();
if (obtenerNivel() !== 0) window.location.href = '/';

document.getElementById('botonCerrarSesion').addEventListener('click', cerrarSesion);

const nombreUsuario = JSON.parse(atob(obtenerToken().split('.')[1])).nombreUsuario;
document.getElementById('nombreUsuarioHeader').textContent = nombreUsuario;
document.getElementById('nombreBienvenida').textContent    = nombreUsuario;

// ============================================================
// PESTAÑAS
// ============================================================

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

function abrirModal(id)  { document.getElementById(id).classList.remove('oculto'); }
function cerrarModal(id) { document.getElementById(id).classList.add('oculto'); }

function badgeEstado(estado) {
    const clases = {
        'Pendiente':  'badge-estado badge-pendiente',
        'Completada': 'badge-estado badge-completada',
        'Cancelada':  'badge-estado badge-cancelada'
    };
    return `<span class="${clases[estado] || 'badge-estado'}">${estado}</span>`;
}

function mostrarMensaje(id, texto, esError = false) {
    const el = document.getElementById(id);
    el.textContent = texto;
    el.className   = 'mensaje-modal' + (esError ? ' error' : '');
    el.classList.remove('oculto');
}

function filtrarTabla(datos, termino, campos) {
    if (!termino) return datos;
    const t = termino.toLowerCase();
    return datos.filter(d => campos.some(c => (d[c] || '').toString().toLowerCase().includes(t)));
}

function filaVacia(colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center;color:#9ca3af;padding:1.5rem">No se encontraron resultados.</td></tr>`;
}

// ============================================================
// ESTADÍSTICAS
// ============================================================

async function cargarEstadisticas() {
    try {
        const [medicos, pacientes, citas] = await Promise.all([
            getMedicos(), getPacientes(), getCitas()
        ]);
        document.getElementById('totalMedicos').textContent          = medicos.length;
        document.getElementById('totalPacientes').textContent        = pacientes.length;
        document.getElementById('totalCitasPendientes').textContent  = citas.filter(c => c.estado === 'Pendiente').length;
        document.getElementById('totalCitasCompletadas').textContent = citas.filter(c => c.estado === 'Completada').length;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ============================================================
// MÉDICOS
// ============================================================

let todosMedicos = [];

async function cargarMedicos() {
    try {
        todosMedicos = await getMedicos();
        renderizarMedicos(todosMedicos);
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

function renderizarMedicos(datos) {
    const tbody = document.getElementById('tablaMedicos');
    tbody.innerHTML = datos.length === 0 ? filaVacia(6) : datos.map(m => `
        <tr>
            <td>${m.idMedico}</td>
            <td>${m.nombreMedico}</td>
            <td>${m.telefonoMedico}</td>
            <td>${m.nombreUsuario}</td>
            <td>Nivel ${m.nivel}</td>
            <td>
                <button class="boton-editar" onclick="prepararEditarMedico(${m.idMedico},'${m.nombreMedico}','${m.telefonoMedico}','${m.nombreUsuario}',${m.nivel})">Editar</button>
                <button class="boton-eliminar" onclick="borrarMedico(${m.idMedico})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroMedicos() {
    const termino = document.getElementById('filtroBuscarMedico').value.trim();
    renderizarMedicos(filtrarTabla(todosMedicos, termino, ['nombreMedico', 'nombreUsuario']));
}

document.getElementById('filtroBuscarMedico').addEventListener('input', aplicarFiltroMedicos);
document.getElementById('filtroBuscarMedico').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroMedicos(); });

document.getElementById('botonCrearMedico').addEventListener('click', () => {
    document.getElementById('tituloModalMedico').textContent     = 'Nuevo médico';
    document.getElementById('idMedicoEditar').value              = '';
    document.getElementById('inputNombreMedico').value           = '';
    document.getElementById('inputTelefonoMedico').value         = '';
    document.getElementById('inputNombreUsuarioMedico').value    = '';
    document.getElementById('inputContrasenaMedico').value       = '';
    document.getElementById('inputNivelMedico').value            = '3';
    document.getElementById('mensajeModalMedico').classList.add('oculto');
    abrirModal('modalMedico');
});

document.getElementById('botonCancelarModalMedico').addEventListener('click', () => cerrarModal('modalMedico'));

document.getElementById('botonGuardarMedico').addEventListener('click', async () => {
    const id             = document.getElementById('idMedicoEditar').value;
    const nombreMedico   = document.getElementById('inputNombreMedico').value.trim();
    const telefonoMedico = document.getElementById('inputTelefonoMedico').value.trim();
    const nombreUsuario  = document.getElementById('inputNombreUsuarioMedico').value.trim();
    const contrasena     = document.getElementById('inputContrasenaMedico').value.trim();
    const nivel          = parseInt(document.getElementById('inputNivelMedico').value);

    if (!nombreMedico || !telefonoMedico || !nombreUsuario) {
        mostrarMensaje('mensajeModalMedico', 'Rellena todos los campos obligatorios.', true);
        return;
    }

    try {
        if (id) {
            await peticion('PUT', `/api/medicos/${id}`, { nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel });
        } else {
            await crearMedico({ nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel });
        }
        cerrarModal('modalMedico');
        cargarMedicos();
        cargarEstadisticas();
    } catch (error) {
        mostrarMensaje('mensajeModalMedico', error.message, true);
    }
});

function prepararEditarMedico(id, nombre, telefono, usuario, nivel) {
    document.getElementById('tituloModalMedico').textContent          = 'Editar médico';
    document.getElementById('idMedicoEditar').value                   = id;
    document.getElementById('inputNombreMedico').value                = nombre;
    document.getElementById('inputTelefonoMedico').value              = telefono;
    document.getElementById('inputNombreUsuarioMedico').value         = usuario;
    document.getElementById('inputContrasenaMedico').value            = '';
    document.getElementById('inputNivelMedico').value                 = nivel;
    document.getElementById('mensajeModalMedico').classList.add('oculto');
    abrirModal('modalMedico');
}

async function borrarMedico(id) {
    if (!confirm('¿Seguro que quieres eliminar este médico?')) return;
    try {
        await eliminarMedico(id);
        cargarMedicos();
        cargarEstadisticas();
    } catch (error) {
        console.error('Error al eliminar médico:', error);
    }
}

// ============================================================
// PACIENTES
// ============================================================

let todosPacientes = [];

async function cargarPacientes() {
    try {
        todosPacientes = await getPacientes();
        renderizarPacientes(todosPacientes);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

function renderizarPacientes(datos) {
    const tbody = document.getElementById('tablaPacientes');
    tbody.innerHTML = datos.length === 0 ? filaVacia(4) : datos.map(p => `
        <tr>
            <td>${p.idPaciente}</td>
            <td>${p.nombrePaciente}</td>
            <td>${p.telefonoPaciente}</td>
            <td>
                <button class="boton-editar" onclick="prepararEditarPaciente(${p.idPaciente},'${p.nombrePaciente}','${p.telefonoPaciente}')">Editar</button>
                <button class="boton-eliminar" onclick="borrarPaciente(${p.idPaciente})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroPacientes() {
    const termino = document.getElementById('filtroBuscarPaciente').value.trim();
    renderizarPacientes(filtrarTabla(todosPacientes, termino, ['nombrePaciente', 'telefonoPaciente']));
}

document.getElementById('filtroBuscarPaciente').addEventListener('input', aplicarFiltroPacientes);
document.getElementById('filtroBuscarPaciente').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroPacientes(); });

document.getElementById('botonCrearPaciente').addEventListener('click', () => {
    document.getElementById('tituloModalPaciente').textContent = 'Nuevo paciente';
    document.getElementById('idPacienteEditar').value          = '';
    document.getElementById('inputNombrePaciente').value       = '';
    document.getElementById('inputTelefonoPaciente').value     = '';
    document.getElementById('mensajeModalPaciente').classList.add('oculto');
    abrirModal('modalPaciente');
});

document.getElementById('botonCancelarModalPaciente').addEventListener('click', () => cerrarModal('modalPaciente'));

document.getElementById('botonGuardarPaciente').addEventListener('click', async () => {
    const id               = document.getElementById('idPacienteEditar').value;
    const nombrePaciente   = document.getElementById('inputNombrePaciente').value.trim();
    const telefonoPaciente = document.getElementById('inputTelefonoPaciente').value.trim();

    if (!nombrePaciente || !telefonoPaciente) {
        mostrarMensaje('mensajeModalPaciente', 'Rellena todos los campos.', true);
        return;
    }

    try {
        if (id) {
            await peticion('PUT', `/api/pacientes/${id}`, { nombrePaciente, telefonoPaciente });
        } else {
            await crearPaciente({ nombrePaciente, telefonoPaciente });
        }
        cerrarModal('modalPaciente');
        cargarPacientes();
        cargarEstadisticas();
    } catch (error) {
        mostrarMensaje('mensajeModalPaciente', error.message, true);
    }
});

function prepararEditarPaciente(id, nombre, telefono) {
    document.getElementById('tituloModalPaciente').textContent = 'Editar paciente';
    document.getElementById('idPacienteEditar').value          = id;
    document.getElementById('inputNombrePaciente').value       = nombre;
    document.getElementById('inputTelefonoPaciente').value     = telefono;
    document.getElementById('mensajeModalPaciente').classList.add('oculto');
    abrirModal('modalPaciente');
}

async function borrarPaciente(id) {
    if (!confirm('¿Seguro que quieres eliminar este paciente?')) return;
    try {
        await eliminarPaciente(id);
        cargarPacientes();
        cargarEstadisticas();
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
    }
}

// ============================================================
// ESPECIALIDADES
// ============================================================

let todasEspecialidades = [];

async function cargarEspecialidades() {
    try {
        todasEspecialidades = await getEspecialidades();
        renderizarEspecialidades(todasEspecialidades);
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

function renderizarEspecialidades(datos) {
    const tbody = document.getElementById('tablaEspecialidades');
    tbody.innerHTML = datos.length === 0 ? filaVacia(3) : datos.map(e => `
        <tr>
            <td>${e.idEspecialidad}</td>
            <td>${e.nombreEspecialidad}</td>
            <td>
                <button class="boton-eliminar" onclick="borrarEspecialidad(${e.idEspecialidad})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroEspecialidades() {
    const termino = document.getElementById('filtroBuscarEspecialidad').value.trim();
    renderizarEspecialidades(filtrarTabla(todasEspecialidades, termino, ['nombreEspecialidad']));
}

document.getElementById('filtroBuscarEspecialidad').addEventListener('input', aplicarFiltroEspecialidades);
document.getElementById('filtroBuscarEspecialidad').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroEspecialidades(); });

document.getElementById('botonCrearEspecialidad').addEventListener('click', () => {
    document.getElementById('inputNombreEspecialidad').value = '';
    document.getElementById('mensajeModalEspecialidad').classList.add('oculto');
    abrirModal('modalEspecialidad');
});

document.getElementById('botonCancelarModalEspecialidad').addEventListener('click', () => cerrarModal('modalEspecialidad'));

document.getElementById('botonGuardarEspecialidad').addEventListener('click', async () => {
    const nombreEspecialidad = document.getElementById('inputNombreEspecialidad').value.trim();
    if (!nombreEspecialidad) {
        mostrarMensaje('mensajeModalEspecialidad', 'Introduce el nombre de la especialidad.', true);
        return;
    }
    try {
        await crearEspecialidad({ nombreEspecialidad });
        cerrarModal('modalEspecialidad');
        cargarEspecialidades();
    } catch (error) {
        mostrarMensaje('mensajeModalEspecialidad', error.message, true);
    }
});

async function borrarEspecialidad(id) {
    if (!confirm('¿Seguro que quieres eliminar esta especialidad?')) return;
    try {
        await eliminarEspecialidad(id);
        cargarEspecialidades();
    } catch (error) {
        console.error('Error al eliminar especialidad:', error);
    }
}

// ============================================================
// CITAS
// ============================================================

let todasCitas = [];

async function cargarCitas() {
    try {
        const [citas, pacientes, medicos] = await Promise.all([
            getCitas(), getPacientes(), getMedicos()
        ]);

        document.getElementById('inputPacienteCita').innerHTML =
            pacientes.map(p => `<option value="${p.idPaciente}">${p.nombrePaciente}</option>`).join('');
        document.getElementById('inputMedicoCita').innerHTML =
            medicos.map(m => `<option value="${m.idMedico}">${m.nombreMedico}</option>`).join('');

        todasCitas = citas;
        renderizarCitas(todasCitas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

function renderizarCitas(datos) {
    const tbody = document.getElementById('tablaCitas');
    tbody.innerHTML = datos.length === 0 ? filaVacia(7) : datos.map(c => `
        <tr>
            <td>${c.idCita}</td>
            <td>${new Date(c.fechaIngreso).toLocaleString('es-ES')}</td>
            <td>${badgeEstado(c.estado)}</td>
            <td>${c.nombrePaciente}</td>
            <td>${c.nombreMedico}</td>
            <td>${c.diagnostico || '-'}</td>
            <td>
                <button class="boton-editar" onclick="prepararEditarCita(${c.idCita},'${c.fechaIngreso}','${c.estado}','${c.diagnostico || ''}',${c.idPaciente},${c.idMedico})">Editar</button>
                <button class="boton-eliminar" onclick="borrarCita(${c.idCita})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroCitas() {
    const termino = document.getElementById('filtroBuscarCita').value.trim().toLowerCase();
    const estado  = document.getElementById('filtroEstadoCita').value;

    let resultado = todasCitas;

    if (termino) {
        resultado = resultado.filter(c =>
            (c.nombrePaciente || '').toLowerCase().includes(termino) ||
            (c.nombreMedico   || '').toLowerCase().includes(termino)
        );
    }

    if (estado) {
        resultado = resultado.filter(c => c.estado === estado);
    }

    renderizarCitas(resultado);
}

document.getElementById('filtroBuscarCita').addEventListener('input', aplicarFiltroCitas);
document.getElementById('filtroBuscarCita').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroCitas(); });
document.getElementById('filtroEstadoCita').addEventListener('change', aplicarFiltroCitas);

document.getElementById('botonCrearCita').addEventListener('click', () => {
    document.getElementById('tituloModalCita').textContent = 'Nueva cita';
    document.getElementById('idCitaEditar').value          = '';
    document.getElementById('inputFechaIngreso').value     = '';
    document.getElementById('inputEstadoCita').value       = 'Pendiente';
    document.getElementById('inputDiagnostico').value      = '';
    document.getElementById('mensajeModalCita').classList.add('oculto');
    abrirModal('modalCita');
});

document.getElementById('botonCancelarModalCita').addEventListener('click', () => cerrarModal('modalCita'));

document.getElementById('botonGuardarCita').addEventListener('click', async () => {
    const id           = document.getElementById('idCitaEditar').value;
    const fechaIngreso = document.getElementById('inputFechaIngreso').value;
    const estado       = document.getElementById('inputEstadoCita').value;
    const diagnostico  = document.getElementById('inputDiagnostico').value.trim();
    const idPaciente   = document.getElementById('inputPacienteCita').value;
    const idMedico     = document.getElementById('inputMedicoCita').value;

    if (!fechaIngreso || !idPaciente || !idMedico) {
        mostrarMensaje('mensajeModalCita', 'Rellena todos los campos obligatorios.', true);
        return;
    }

    try {
        if (id) {
            await peticion('PUT', `/api/citas/${id}`, { fechaIngreso, estado, diagnostico, idPaciente, idMedico });
        } else {
            await crearCita({ fechaIngreso, estado, diagnostico, idPaciente, idMedico });
        }
        cerrarModal('modalCita');
        cargarCitas();
        cargarEstadisticas();
    } catch (error) {
        mostrarMensaje('mensajeModalCita', error.message, true);
    }
});

function prepararEditarCita(id, fecha, estado, diagnostico, idPaciente, idMedico) {
    document.getElementById('tituloModalCita').textContent = 'Editar cita';
    document.getElementById('idCitaEditar').value          = id;
    document.getElementById('inputFechaIngreso').value     = fecha.slice(0, 16);
    document.getElementById('inputEstadoCita').value       = estado;
    document.getElementById('inputDiagnostico').value      = diagnostico;
    document.getElementById('inputPacienteCita').value     = idPaciente;
    document.getElementById('inputMedicoCita').value       = idMedico;
    document.getElementById('mensajeModalCita').classList.add('oculto');
    abrirModal('modalCita');
}

async function borrarCita(id) {
    if (!confirm('¿Seguro que quieres eliminar esta cita?')) return;
    try {
        await eliminarCita(id);
        cargarCitas();
        cargarEstadisticas();
    } catch (error) {
        console.error('Error al eliminar cita:', error);
    }
}

// ============================================================
// TRATAMIENTOS
// ============================================================

let todosTratamientos = [];

async function cargarTratamientos() {
    try {
        const [tratamientos, citas, pacientes] = await Promise.all([
            getTratamientos(), getCitas(), getPacientes()
        ]);

        document.getElementById('inputCitaTratamiento').innerHTML =
            citas.map(c => `<option value="${c.idCita}">Cita ${c.idCita} - ${c.nombrePaciente}</option>`).join('');
        document.getElementById('inputPacienteTratamiento').innerHTML =
            pacientes.map(p => `<option value="${p.idPaciente}">${p.nombrePaciente}</option>`).join('');

        todosTratamientos = tratamientos;
        renderizarTratamientos(todosTratamientos);
    } catch (error) {
        console.error('Error al cargar tratamientos:', error);
    }
}

function renderizarTratamientos(datos) {
    const tbody = document.getElementById('tablaTratamientos');
    tbody.innerHTML = datos.length === 0 ? filaVacia(6) : datos.map(t => `
        <tr>
            <td>${t.idTratamiento}</td>
            <td>${t.medicamento}</td>
            <td>${t.dosis}</td>
            <td>${t.recomendacion || '-'}</td>
            <td>${t.nombrePaciente}</td>
            <td>
                <button class="boton-editar" onclick="prepararEditarTratamiento(${t.idTratamiento},'${t.medicamento}','${t.dosis}','${t.recomendacion || ''}',${t.idCita},${t.idPaciente})">Editar</button>
                <button class="boton-eliminar" onclick="borrarTratamiento(${t.idTratamiento})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroTratamientos() {
    const termino = document.getElementById('filtroBuscarTratamiento').value.trim();
    renderizarTratamientos(filtrarTabla(todosTratamientos, termino, ['medicamento', 'nombrePaciente']));
}

document.getElementById('filtroBuscarTratamiento').addEventListener('input', aplicarFiltroTratamientos);
document.getElementById('filtroBuscarTratamiento').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroTratamientos(); });

document.getElementById('botonCrearTratamiento').addEventListener('click', () => {
    document.getElementById('tituloModalTratamiento').textContent = 'Nuevo tratamiento';
    document.getElementById('idTratamientoEditar').value          = '';
    document.getElementById('inputMedicamento').value             = '';
    document.getElementById('inputDosis').value                   = '';
    document.getElementById('inputRecomendacion').value           = '';
    document.getElementById('mensajeModalTratamiento').classList.add('oculto');
    abrirModal('modalTratamiento');
});

document.getElementById('botonCancelarModalTratamiento').addEventListener('click', () => cerrarModal('modalTratamiento'));

document.getElementById('botonGuardarTratamiento').addEventListener('click', async () => {
    const id            = document.getElementById('idTratamientoEditar').value;
    const medicamento   = document.getElementById('inputMedicamento').value.trim();
    const dosis         = document.getElementById('inputDosis').value.trim();
    const recomendacion = document.getElementById('inputRecomendacion').value.trim();
    const idCita        = document.getElementById('inputCitaTratamiento').value;
    const idPaciente    = document.getElementById('inputPacienteTratamiento').value;

    if (!medicamento || !dosis || !idCita || !idPaciente) {
        mostrarMensaje('mensajeModalTratamiento', 'Rellena todos los campos obligatorios.', true);
        return;
    }

    try {
        if (id) {
            await peticion('PUT', `/api/tratamientos/${id}`, { medicamento, dosis, recomendacion, idCita, idPaciente });
        } else {
            await crearTratamiento({ medicamento, dosis, recomendacion, idCita, idPaciente });
        }
        cerrarModal('modalTratamiento');
        cargarTratamientos();
    } catch (error) {
        mostrarMensaje('mensajeModalTratamiento', error.message, true);
    }
});

function prepararEditarTratamiento(id, medicamento, dosis, recomendacion, idCita, idPaciente) {
    document.getElementById('tituloModalTratamiento').textContent = 'Editar tratamiento';
    document.getElementById('idTratamientoEditar').value          = id;
    document.getElementById('inputMedicamento').value             = medicamento;
    document.getElementById('inputDosis').value                   = dosis;
    document.getElementById('inputRecomendacion').value           = recomendacion;
    document.getElementById('inputCitaTratamiento').value         = idCita;
    document.getElementById('inputPacienteTratamiento').value     = idPaciente;
    document.getElementById('mensajeModalTratamiento').classList.add('oculto');
    abrirModal('modalTratamiento');
}

async function borrarTratamiento(id) {
    if (!confirm('¿Seguro que quieres eliminar este tratamiento?')) return;
    try {
        await eliminarTratamiento(id);
        cargarTratamientos();
    } catch (error) {
        console.error('Error al eliminar tratamiento:', error);
    }
}

// ============================================================
// PRUEBAS
// ============================================================

let todasPruebas = [];

async function cargarPruebas() {
    try {
        const [pruebas, citas, pacientes] = await Promise.all([
            getPruebas(), getCitas(), getPacientes()
        ]);

        document.getElementById('inputCitaPrueba').innerHTML =
            citas.map(c => `<option value="${c.idCita}">Cita ${c.idCita} - ${c.nombrePaciente}</option>`).join('');
        document.getElementById('inputPacientePrueba').innerHTML =
            pacientes.map(p => `<option value="${p.idPaciente}">${p.nombrePaciente}</option>`).join('');

        todasPruebas = pruebas;
        renderizarPruebas(todasPruebas);
    } catch (error) {
        console.error('Error al cargar pruebas:', error);
    }
}

function renderizarPruebas(datos) {
    const tbody = document.getElementById('tablaPruebas');
    tbody.innerHTML = datos.length === 0 ? filaVacia(6) : datos.map(p => `
        <tr>
            <td>${p.idPrueba}</td>
            <td>${p.nombrePrueba}</td>
            <td>${p.resultadoPrueba || '-'}</td>
            <td>${new Date(p.fechaPrueba).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
            <td>${p.nombrePaciente}</td>
            <td>
                <button class="boton-editar" onclick="prepararEditarPrueba(${p.idPrueba},'${p.nombrePrueba}','${p.resultadoPrueba || ''}','${p.fechaPrueba}',${p.idCita},${p.idPaciente})">Editar</button>
                <button class="boton-eliminar" onclick="borrarPrueba(${p.idPrueba})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function aplicarFiltroPruebas() {
    const termino = document.getElementById('filtroBuscarPrueba').value.trim();
    renderizarPruebas(filtrarTabla(todasPruebas, termino, ['nombrePrueba', 'nombrePaciente']));
}

document.getElementById('filtroBuscarPrueba').addEventListener('input', aplicarFiltroPruebas);
document.getElementById('filtroBuscarPrueba').addEventListener('keydown', e => { if (e.key === 'Enter') aplicarFiltroPruebas(); });

document.getElementById('botonCrearPrueba').addEventListener('click', () => {
    document.getElementById('tituloModalPrueba').textContent  = 'Nueva prueba';
    document.getElementById('idPruebaEditar').value           = '';
    document.getElementById('inputNombrePrueba').value        = '';
    document.getElementById('inputResultadoPrueba').value     = '';
    document.getElementById('inputFechaPrueba').value         = '';
    document.getElementById('mensajeModalPrueba').classList.add('oculto');
    abrirModal('modalPrueba');
});

document.getElementById('botonCancelarModalPrueba').addEventListener('click', () => cerrarModal('modalPrueba'));

document.getElementById('botonGuardarPrueba').addEventListener('click', async () => {
    const id              = document.getElementById('idPruebaEditar').value;
    const nombrePrueba    = document.getElementById('inputNombrePrueba').value.trim();
    const resultadoPrueba = document.getElementById('inputResultadoPrueba').value.trim();
    const fechaPrueba     = document.getElementById('inputFechaPrueba').value;
    const idCita          = document.getElementById('inputCitaPrueba').value;
    const idPaciente      = document.getElementById('inputPacientePrueba').value;

    if (!nombrePrueba || !fechaPrueba || !idCita || !idPaciente) {
        mostrarMensaje('mensajeModalPrueba', 'Rellena todos los campos obligatorios.', true);
        return;
    }

    try {
        if (id) {
            await peticion('PUT', `/api/pruebas/${id}`, { nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente });
        } else {
            await crearPrueba({ nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente });
        }
        cerrarModal('modalPrueba');
        cargarPruebas();
    } catch (error) {
        mostrarMensaje('mensajeModalPrueba', error.message, true);
    }
});

function prepararEditarPrueba(id, nombre, resultado, fecha, idCita, idPaciente) {
    document.getElementById('tituloModalPrueba').textContent  = 'Editar prueba';
    document.getElementById('idPruebaEditar').value           = id;
    document.getElementById('inputNombrePrueba').value        = nombre;
    document.getElementById('inputResultadoPrueba').value     = resultado;
    document.getElementById('inputFechaPrueba').value         = fecha;
    document.getElementById('inputCitaPrueba').value          = idCita;
    document.getElementById('inputPacientePrueba').value      = idPaciente;
    document.getElementById('mensajeModalPrueba').classList.add('oculto');
    abrirModal('modalPrueba');
}

async function borrarPrueba(id) {
    if (!confirm('¿Seguro que quieres eliminar esta prueba?')) return;
    try {
        await eliminarPrueba(id);
        cargarPruebas();
    } catch (error) {
        console.error('Error al eliminar prueba:', error);
    }
}

// ============================================================
// ESTRUCTURA
// ============================================================

document.getElementById('botonCrearTabla').addEventListener('click', async () => {
    const sql       = document.getElementById('inputCrearTabla').value.trim();
    const resultado = document.getElementById('resultadoCrear');
    if (!sql) return;
    try {
        await peticion('POST', '/api/estructura', { sql });
        resultado.textContent = '✓ Tabla creada correctamente.';
        resultado.style.color = '#27500A';
    } catch (error) {
        resultado.textContent = '✗ Error: ' + error.message;
        resultado.style.color = '#791F1F';
    }
});

document.getElementById('botonModificarTabla').addEventListener('click', async () => {
    const sql       = document.getElementById('inputModificarTabla').value.trim();
    const resultado = document.getElementById('resultadoModificar');
    if (!sql) return;
    try {
        await peticion('POST', '/api/estructura', { sql });
        resultado.textContent = '✓ Tabla modificada correctamente.';
        resultado.style.color = '#27500A';
    } catch (error) {
        resultado.textContent = '✗ Error: ' + error.message;
        resultado.style.color = '#791F1F';
    }
});

document.getElementById('botonEliminarTabla').addEventListener('click', async () => {
    const sql       = document.getElementById('inputEliminarTabla').value.trim();
    const resultado = document.getElementById('resultadoEliminar');
    if (!sql) return;
    if (!confirm('¿Seguro que quieres eliminar esta tabla? Esta acción no se puede deshacer.')) return;
    try {
        await peticion('POST', '/api/estructura', { sql });
        resultado.textContent = '✓ Tabla eliminada correctamente.';
        resultado.style.color = '#27500A';
    } catch (error) {
        resultado.textContent = '✗ Error: ' + error.message;
        resultado.style.color = '#791F1F';
    }
});

// ============================================================
// INICIALIZACIÓN
// ============================================================

cargarEstadisticas();
cargarMedicos();
cargarPacientes();
cargarEspecialidades();
cargarCitas();
cargarTratamientos();
cargarPruebas();