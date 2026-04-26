'use strict';

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const cabecera = req.headers['authorization'];
    const token    = cabecera && cabecera.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado.' });
    }

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = datos;
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
}

function verificarNivel(...nivelesPermitidos) {
    return (req, res, next) => {
        if (!nivelesPermitidos.includes(req.usuario.nivel)) {
            return res.status(403).json({ mensaje: 'No tienes permisos para acceder a este recurso.' });
        }
        next();
    };
}

module.exports = { verificarToken, verificarNivel };