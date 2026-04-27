'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todas las citas (niveles 0, 1, 2 y 3)
router.get('/citas', verificarNivel(0, 1, 2, 3), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT C.*, P.nombrePaciente, M.nombreMedico
             FROM Cita C
             JOIN Paciente P ON C.idPaciente = P.idPaciente
             JOIN Medico M ON C.idMedico = M.idMedico`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener una cita por ID (niveles 0, 1 y 2)
router.get('/citas/:id', verificarNivel(0, 1, 2), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query(
            `SELECT C.*, P.nombrePaciente, M.nombreMedico
             FROM Cita C
             JOIN Paciente P ON C.idPaciente = P.idPaciente
             JOIN Medico M ON C.idMedico = M.idMedico
             WHERE C.idCita = ?`,
            [id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada.' });
        }
        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error al obtener cita:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener citas por paciente (niveles 0, 1, 2 y 3)
router.get('/citas/paciente/:id', verificarNivel(0, 1, 2, 3), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query(
            `SELECT C.*, M.nombreMedico
             FROM Cita C
             JOIN Medico M ON C.idMedico = M.idMedico
             WHERE C.idPaciente = ?`,
            [id]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener citas del paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear una cita (niveles 0 y 1)
router.post('/citas', verificarNivel(0, 1), async (req, res) => {
    const { fechaIngreso, estado, diagnostico, idPaciente, idMedico } = req.body;
    if (!fechaIngreso || !idPaciente || !idMedico) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Cita (fechaIngreso, estado, diagnostico, idPaciente, idMedico) VALUES (?, ?, ?, ?, ?)',
            [fechaIngreso, estado || 'Pendiente', diagnostico || null, idPaciente, idMedico]
        );
        return res.status(201).json({ mensaje: 'Cita creada correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear cita:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// PUT - Actualizar una cita (niveles 0 y 1)
router.put('/citas/:id', verificarNivel(0, 1), async (req, res) => {
    const { id } = req.params;
    const { fechaIngreso, estado, diagnostico, idPaciente, idMedico } = req.body;
    try {
        const [resultado] = await pool.query(
            'UPDATE Cita SET fechaIngreso = ?, estado = ?, diagnostico = ?, idPaciente = ?, idMedico = ? WHERE idCita = ?',
            [fechaIngreso, estado, diagnostico, idPaciente, idMedico, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Cita actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar una cita (solo nivel 0)
router.delete('/citas/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Cita WHERE idCita = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Cita eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;