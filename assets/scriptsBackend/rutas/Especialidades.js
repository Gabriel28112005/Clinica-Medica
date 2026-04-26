'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// GET - Obtener todas las especialidades (todos los niveles)
router.get('/especialidades', verificarNivel(0, 1, 2, 3), async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM Especialidad');
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET - Obtener especialidades de un médico concreto (todos los niveles)
router.get('/especialidades/medico/:id', verificarNivel(0, 1, 2, 3), async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query(
            `SELECT E.idEspecialidad, E.nombreEspecialidad
             FROM Especialidad E
             JOIN Medico_Especialidad ME ON E.idEspecialidad = ME.idEspecialidad
             WHERE ME.idMedico = ?`,
            [id]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al obtener especialidades del médico:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// POST - Crear una especialidad (solo nivel 0)
router.post('/especialidades', verificarNivel(0), async (req, res) => {
    const { nombreEspecialidad } = req.body;
    if (!nombreEspecialidad) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    try {
        const [resultado] = await pool.query(
            'INSERT INTO Especialidad (nombreEspecialidad) VALUES (?)',
            [nombreEspecialidad]
        );
        return res.status(201).json({ mensaje: 'Especialidad creada correctamente.', id: resultado.insertId });
    } catch (error) {
        console.error('Error al crear especialidad:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// DELETE - Eliminar una especialidad (solo nivel 0)
router.delete('/especialidades/:id', verificarNivel(0), async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM Especialidad WHERE idEspecialidad = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Especialidad no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Especialidad eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar especialidad:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;