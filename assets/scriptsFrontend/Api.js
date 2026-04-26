'use strict';

function obtenerToken() {
    return localStorage.getItem('token');
}

async function peticion(metodo, url, cuerpo = null) {
    const opciones = {
        method: metodo,
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        }
    };

    if (cuerpo) {
        opciones.body = JSON.stringify(cuerpo);
    }

    const respuesta = await fetch(url, opciones);
    const datos     = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error en la petición.');
    }

    return datos;
}

// Médicos
async function getMedicos()          { return peticion('GET',    '/api/medicos'); }
async function getMedico(id)         { return peticion('GET',    `/api/medicos/${id}`); }
async function crearMedico(datos)    { return peticion('POST',   '/api/medicos', datos); }
async function editarMedico(id, datos) { return peticion('PUT', `/api/medicos/${id}`, datos); }
async function eliminarMedico(id)    { return peticion('DELETE', `/api/medicos/${id}`); }

// Pacientes
async function getPacientes()           { return peticion('GET',    '/api/pacientes'); }
async function getPaciente(id)          { return peticion('GET',    `/api/pacientes/${id}`); }
async function crearPaciente(datos)     { return peticion('POST',   '/api/pacientes', datos); }
async function editarPaciente(id, datos)  { return peticion('PUT', `/api/pacientes/${id}`, datos); }
async function eliminarPaciente(id)     { return peticion('DELETE', `/api/pacientes/${id}`); }

// Especialidades
async function getEspecialidades()          { return peticion('GET',    '/api/especialidades'); }
async function getEspecialidadesMedico(id)  { return peticion('GET',    `/api/especialidades/medico/${id}`); }
async function crearEspecialidad(datos)     { return peticion('POST',   '/api/especialidades', datos); }
async function eliminarEspecialidad(id)     { return peticion('DELETE', `/api/especialidades/${id}`); }

// Citas
async function getCitas()               { return peticion('GET',    '/api/citas'); }
async function getCita(id)              { return peticion('GET',    `/api/citas/${id}`); }
async function getCitasPaciente(id)     { return peticion('GET',    `/api/citas/paciente/${id}`); }
async function crearCita(datos)         { return peticion('POST',   '/api/citas', datos); }
async function editarCita(id, datos)    { return peticion('PUT',    `/api/citas/${id}`, datos); }
async function eliminarCita(id)         { return peticion('DELETE', `/api/citas/${id}`); }

// Tratamientos
async function getTratamientos()            { return peticion('GET',    '/api/tratamientos'); }
async function getTratamientosPaciente(id)  { return peticion('GET',    `/api/tratamientos/paciente/${id}`); }
async function crearTratamiento(datos)      { return peticion('POST',   '/api/tratamientos', datos); }
async function editarTratamiento(id, datos) { return peticion('PUT',    `/api/tratamientos/${id}`, datos); }
async function eliminarTratamiento(id)      { return peticion('DELETE', `/api/tratamientos/${id}`); }

// Pruebas
async function getPruebas()             { return peticion('GET',    '/api/pruebas'); }
async function getPruebasPaciente(id)   { return peticion('GET',    `/api/pruebas/paciente/${id}`); }
async function crearPrueba(datos)       { return peticion('POST',   '/api/pruebas', datos); }
async function editarPrueba(id, datos)  { return peticion('PUT',    `/api/pruebas/${id}`, datos); }
async function eliminarPrueba(id)       { return peticion('DELETE', `/api/pruebas/${id}`); }