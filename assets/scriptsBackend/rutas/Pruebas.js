'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todas las pruebas (niveles 0, 1 y 2)
router.get('/pruebas', verificarNivel(0, 1, 2), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT PR.*, P.nombrePaciente
             FROM Prueba PR
             JOIN Paciente P ON PR.idPaciente = P.idPaciente`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener pruebas:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener pruebas de un paciente (niveles 0, 1 y 2)
router.get('/pruebas/paciente/:id', verificarNivel(0, 1, 2), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query(
            'SELECT * FROM Prueba WHERE idPaciente = ?',
            [id]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener pruebas del paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear una prueba (niveles 0 y 1)
router.post('/pruebas', verificarNivel(0, 1), async (req, res) => {
    const { nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente } = req.body;
    if (!nombrePrueba || !fechaPrueba || !idCita || !idPaciente) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Prueba (nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente) VALUES (?, ?, ?, ?, ?)',
            [nombrePrueba, resultadoPrueba || null, fechaPrueba, idCita, idPaciente]
        );
        return res.status(201).json({ mensaje: 'Prueba creada correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear prueba:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// PUT - Actualizar una prueba (niveles 0 y 1)
router.put('/pruebas/:id', verificarNivel(0, 1), async (req, res) => {
    const { id } = req.params;
    const { nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente } = req.body;
    try {
        const [resultado] = await pool.query(
            'UPDATE Prueba SET nombrePrueba = ?, resultadoPrueba = ?, fechaPrueba = ?, idCita = ?, idPaciente = ? WHERE idPrueba = ?',
            [nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Prueba no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Prueba actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar prueba:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar una prueba (solo nivel 0)
router.delete('/pruebas/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Prueba WHERE idPrueba = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Prueba no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Prueba eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar prueba:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;