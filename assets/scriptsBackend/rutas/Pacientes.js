'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todos los pacientes (niveles 0, 1 y 2)
router.get('/pacientes', verificarNivel(0, 1, 2), async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM Paciente');
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener un paciente por ID (niveles 0, 1 y 2)
router.get('/pacientes/:id', verificarNivel(0, 1, 2), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query('SELECT * FROM Paciente WHERE idPaciente = ?', [id]);
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
        }
        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error al obtener paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear un paciente (niveles 0 y 1)
router.post('/pacientes', verificarNivel(0, 1), async (req, res) => {
    const { nombrePaciente, telefonoPaciente } = req.body;
    if (!nombrePaciente || !telefonoPaciente) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Paciente (nombrePaciente, telefonoPaciente) VALUES (?, ?)',
            [nombrePaciente, telefonoPaciente]
        );
        return res.status(201).json({ mensaje: 'Paciente creado correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// PUT - Actualizar un paciente (niveles 0 y 1)
router.put('/pacientes/:id', verificarNivel(0, 1), async (req, res) => {
    const { id } = req.params;
    const { nombrePaciente, telefonoPaciente } = req.body;
    try {
        const [resultado] = await pool.query(
            'UPDATE Paciente SET nombrePaciente = ?, telefonoPaciente = ? WHERE idPaciente = ?',
            [nombrePaciente, telefonoPaciente, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Paciente actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar un paciente (solo nivel 0)
router.delete('/pacientes/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Paciente WHERE idPaciente = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Paciente eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;