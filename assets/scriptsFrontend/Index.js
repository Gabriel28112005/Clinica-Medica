'use strict';

const formulario              = document.getElementById('formularioLogin');
const inputNombreUsuario      = document.getElementById('nombreUsuario');
const inputContrasena         = document.getElementById('contrasena');
const alertaError             = document.getElementById('alertaError');
const textoError              = document.getElementById('textoError');
const errorNombreUsuario      = document.getElementById('errorNombreUsuario');
const errorContrasena         = document.getElementById('errorContrasena');
const botonAcceder            = document.getElementById('botonAcceder');
const textoBoton              = document.getElementById('textoBoton');
const cargadorBoton           = document.getElementById('cargadorBoton');
const botonMostrarContrasena  = document.getElementById('botonMostrarContrasena');
const iconoOjoAbierto         = document.getElementById('iconoOjoAbierto');
const iconoOjoTachado         = document.getElementById('iconoOjoTachado');

// Mostrar / ocultar contraseña
botonMostrarContrasena.addEventListener('click', () => {
    const visible = inputContrasena.type === 'text';
    inputContrasena.type = visible ? 'password' : 'text';
    iconoOjoAbierto.classList.toggle('oculto', !visible);
    iconoOjoTachado.classList.toggle('oculto', visible);
});

// Submit del formulario
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreUsuario = inputNombreUsuario.value.trim();
    const contrasena    = inputContrasena.value.trim();

    // Resetear errores
    alertaError.classList.add('oculto');
    errorNombreUsuario.classList.add('oculto');
    errorContrasena.classList.add('oculto');
    inputNombreUsuario.classList.remove('campo-invalido');
    inputContrasena.classList.remove('campo-invalido');

    // Validación
    let hayError = false;

    if (!nombreUsuario) {
        errorNombreUsuario.classList.remove('oculto');
        inputNombreUsuario.classList.add('campo-invalido');
        hayError = true;
    }

    if (!contrasena) {
        errorContrasena.classList.remove('oculto');
        inputContrasena.classList.add('campo-invalido');
        hayError = true;
    }

    if (hayError) return;

    // Estado de carga
    textoBoton.classList.add('oculto');
    cargadorBoton.classList.remove('oculto');
    botonAcceder.disabled = true;

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreUsuario, contrasena })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            textoError.textContent = datos.mensaje || 'Usuario o contraseña incorrectos.';
            alertaError.classList.remove('oculto');
            return;
        }

        localStorage.setItem('token', datos.token);
        localStorage.setItem('nivel', datos.nivel);

        if (datos.nivel === 0) {
            window.location.href = '/admin';
        } else if (datos.nivel === 1) {
            window.location.href = '/consultasnivel1';
        } else if (datos.nivel === 2) {
            window.location.href = '/consultasnivel2';
        } else if (datos.nivel === 3) {
            window.location.href = '/consultasnivel3';
        } else {
            textoError.textContent = 'Nivel de acceso no reconocido.';
            alertaError.classList.remove('oculto');
        }

    } catch (error) {
        textoError.textContent = 'No se pudo conectar con el servidor.';
        alertaError.classList.remove('oculto');
    } finally {
        textoBoton.classList.remove('oculto');
        cargadorBoton.classList.add('oculto');
        botonAcceder.disabled = false;
    }
});