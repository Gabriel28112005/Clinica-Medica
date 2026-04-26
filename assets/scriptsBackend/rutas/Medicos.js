'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todos los médicos (niveles 0 y 1)
router.get('/medicos', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM Medico');
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener médicos:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener un médico por ID (niveles 0 y 1)
router.get('/medicos/:id', verificarNivel(0, 1), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query('SELECT * FROM Medico WHERE idMedico = ?', [id]);
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado.' });
        }
        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error al obtener médico:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear un médico (solo nivel 0)
router.post('/medicos', verificarNivel(0), async (req, res) => {
    const { nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel } = req.body;
    if (!nombreMedico || !telefonoMedico || !nombreUsuario || !contrasena || nivel === undefined) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Medico (nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel) VALUES (?, ?, ?, ?, ?)',
            [nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel]
        );
        return res.status(201).json({ mensaje: 'Médico creado correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear médico:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// PUT - Actualizar un médico (solo nivel 0)
router.put('/medicos/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    const { nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel } = req.body;
    try {
        const [resultado] = await pool.query(
            'UPDATE Medico SET nombreMedico = ?, telefonoMedico = ?, nombreUsuario = ?, contrasena = ?, nivel = ? WHERE idMedico = ?',
            [nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Médico actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar médico:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar un médico (solo nivel 0)
router.delete('/medicos/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Medico WHERE idMedico = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Médico eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar médico:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;