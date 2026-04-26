'use strict';

function verificarAcceso() {
    const token = localStorage.getItem('token');
    const nivel = localStorage.getItem('nivel');

    if (!token || nivel === null) {
        window.location.href = '/';
        return false;
    }

    return true;
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nivel');
    window.location.href = '/';
}

function obtenerNivel() {
    return parseInt(localStorage.getItem('nivel'));
}

function obtenerToken() {
    return localStorage.getItem('token');
}