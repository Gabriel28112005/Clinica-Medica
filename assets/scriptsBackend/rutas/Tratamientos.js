'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todos los tratamientos (niveles 0, 1 y 2)
router.get('/tratamientos', verificarNivel(0, 1, 2), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT T.*, P.nombrePaciente
             FROM Tratamiento T
             JOIN Paciente P ON T.idPaciente = P.idPaciente`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener tratamientos:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener tratamientos de un paciente (niveles 0, 1 y 2)
router.get('/tratamientos/paciente/:id', verificarNivel(0, 1, 2), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query(
            'SELECT * FROM Tratamiento WHERE idPaciente = ?',
            [id]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener tratamientos del paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear un tratamiento (niveles 0 y 1)
router.post('/tratamientos', verificarNivel(0, 1), async (req, res) => {
    const { recomendacion, medicamento, dosis, idCita, idPaciente } = req.body;
    if (!medicamento || !dosis || !idCita || !idPaciente) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Tratamiento (recomendacion, medicamento, dosis, idCita, idPaciente) VALUES (?, ?, ?, ?, ?)',
            [recomendacion || null, medicamento, dosis, idCita, idPaciente]
        );
        return res.status(201).json({ mensaje: 'Tratamiento creado correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear tratamiento:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// PUT - Actualizar un tratamiento (niveles 0 y 1)
router.put('/tratamientos/:id', verificarNivel(0, 1), async (req, res) => {
    const { id } = req.params;
    const { recomendacion, medicamento, dosis, idCita, idPaciente } = req.body;
    try {
        const [resultado] = await pool.query(
            'UPDATE Tratamiento SET recomendacion = ?, medicamento = ?, dosis = ?, idCita = ?, idPaciente = ? WHERE idTratamiento = ?',
            [recomendacion, medicamento, dosis, idCita, idPaciente, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tratamiento no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Tratamiento actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar tratamiento:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar un tratamiento (solo nivel 0)
router.delete('/tratamientos/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Tratamiento WHERE idTratamiento = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tratamiento no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Tratamiento eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar tratamiento:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;