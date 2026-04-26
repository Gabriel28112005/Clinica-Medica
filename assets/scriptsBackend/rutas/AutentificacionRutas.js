'use strict';

const express = require('express');
const jwt     = require('jsonwebtoken');
const pool    = require('../Db');

const router = express.Router();

router.post('/login', async (req, res) => {

    const { nombreUsuario, contrasena } = req.body;

    if (!nombreUsuario || !contrasena) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    try {
        const [filas] = await pool.query(
            'SELECT * FROM Medico WHERE nombreUsuario = ?',
            [nombreUsuario]
        );

        if (filas.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
        }

        const medico = filas[0];

        if (contrasena !== medico.contrasena) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
        }

        const token = jwt.sign(
            {
                id:           medico.idMedico,
                nombreUsuario: medico.nombreUsuario,
                nivel:        medico.nivel
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            mensaje: 'Login correcto.',
            token,
            nivel: medico.nivel
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }

});

module.exports = router;