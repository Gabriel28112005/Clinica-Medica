'use strict';

const express = require('express');
const pool    = require('../Db');
const { verificarNivel } = require('../autentificacionRoles/Middleware');

const router = express.Router();

// ============================================================
// NIVEL 1 - Consultas importantes (estadísticas y rankings)
// ============================================================

// Total de citas por médico
router.get('/consultas/citas-por-medico', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT M.nombreMedico, COUNT(C.idCita) AS totalCitas
             FROM Medico M
             LEFT JOIN Cita C ON M.idMedico = C.idMedico
             GROUP BY M.idMedico, M.nombreMedico
             ORDER BY totalCitas DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Total de citas por estado
router.get('/consultas/citas-por-estado', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT estado, COUNT(*) AS total
             FROM Cita
             GROUP BY estado`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Médico con más pacientes atendidos
router.get('/consultas/medico-mas-pacientes', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT M.nombreMedico, COUNT(DISTINCT C.idPaciente) AS totalPacientes
             FROM Medico M
             LEFT JOIN Cita C ON M.idMedico = C.idMedico
             GROUP BY M.idMedico, M.nombreMedico
             ORDER BY totalPacientes DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Prueba diagnóstica más realizada
router.get('/consultas/prueba-mas-realizada', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT nombrePrueba, COUNT(*) AS totalVeces
             FROM Prueba
             GROUP BY nombrePrueba
             ORDER BY totalVeces DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Pacientes con más citas
router.get('/consultas/pacientes-mas-citas', verificarNivel(0, 1), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT P.nombrePaciente, COUNT(C.idCita) AS totalCitas
             FROM Paciente P
             LEFT JOIN Cita C ON P.idPaciente = C.idPaciente
             GROUP BY P.idPaciente, P.nombrePaciente
             ORDER BY totalCitas DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ============================================================
// NIVEL 2 - Consultas restringidas (filtros combinados)
// ============================================================

// Buscar citas por rango de fechas
router.get('/consultas/citas-por-fechas', verificarNivel(0, 1, 2), async (req, res) => {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
        return res.status(400).json({ mensaje: 'Faltan parámetros de fecha.' });
    }
    try {
        const [filas] = await pool.query(
            `SELECT C.*, P.nombrePaciente, M.nombreMedico
             FROM Cita C
             JOIN Paciente P ON C.idPaciente = P.idPaciente
             JOIN Medico M ON C.idMedico = M.idMedico
             WHERE C.fechaIngreso BETWEEN ? AND ?
             ORDER BY C.fechaIngreso ASC`,
            [desde, hasta]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Buscar citas por estado y médico combinados
router.get('/consultas/citas-por-estado-medico', verificarNivel(0, 1, 2), async (req, res) => {
    const { estado, idMedico } = req.query;
    try {
        let sql    = `SELECT C.*, P.nombrePaciente, M.nombreMedico
                      FROM Cita C
                      JOIN Paciente P ON C.idPaciente = P.idPaciente
                      JOIN Medico M ON C.idMedico = M.idMedico
                      WHERE 1=1`;
        const params = [];

        if (estado)   { sql += ' AND C.estado = ?';   params.push(estado); }
        if (idMedico) { sql += ' AND C.idMedico = ?'; params.push(idMedico); }

        sql += ' ORDER BY C.fechaIngreso DESC';

        const [filas] = await pool.query(sql, params);
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Buscar tratamientos por medicamento
router.get('/consultas/tratamientos-por-medicamento', verificarNivel(0, 1, 2), async (req, res) => {
    const { medicamento } = req.query;
    if (!medicamento) {
        return res.status(400).json({ mensaje: 'Falta el parámetro medicamento.' });
    }
    try {
        const [filas] = await pool.query(
            `SELECT T.*, P.nombrePaciente
             FROM Tratamiento T
             JOIN Paciente P ON T.idPaciente = P.idPaciente
             WHERE T.medicamento LIKE ?`,
            [`%${medicamento}%`]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Buscar pruebas por tipo y rango de fechas
router.get('/consultas/pruebas-por-tipo-fecha', verificarNivel(0, 1, 2), async (req, res) => {
    const { tipo, desde, hasta } = req.query;
    try {
        let sql    = `SELECT PR.*, P.nombrePaciente
                      FROM Prueba PR
                      JOIN Paciente P ON PR.idPaciente = P.idPaciente
                      WHERE 1=1`;
        const params = [];

        if (tipo)  { sql += ' AND PR.nombrePrueba LIKE ?'; params.push(`%${tipo}%`); }
        if (desde) { sql += ' AND PR.fechaPrueba >= ?';    params.push(desde); }
        if (hasta) { sql += ' AND PR.fechaPrueba <= ?';    params.push(hasta); }

        sql += ' ORDER BY PR.fechaPrueba DESC';

        const [filas] = await pool.query(sql, params);
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ============================================================
// NIVEL 3 - Consultas básicas (listados simples)
// ============================================================

// Listado de todos los pacientes
router.get('/consultas/listado-pacientes', verificarNivel(0, 1, 2, 3), async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM Paciente ORDER BY nombrePaciente ASC');
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Listado de médicos con sus especialidades
router.get('/consultas/listado-medicos', verificarNivel(0, 1, 2, 3), async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT M.idMedico, M.nombreMedico, M.telefonoMedico,
                    GROUP_CONCAT(E.nombreEspecialidad SEPARATOR ', ') AS especialidades
             FROM Medico M
             LEFT JOIN Medico_Especialidad ME ON M.idMedico = ME.idMedico
             LEFT JOIN Especialidad E ON ME.idEspecialidad = E.idEspecialidad
             GROUP BY M.idMedico, M.nombreMedico, M.telefonoMedico
             ORDER BY M.nombreMedico ASC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Buscar paciente por nombre
router.get('/consultas/buscar-paciente', verificarNivel(0, 1, 2, 3), async (req, res) => {
    const { nombre } = req.query;
    if (!nombre) {
        return res.status(400).json({ mensaje: 'Falta el parámetro nombre.' });
    }
    try {
        const [filas] = await pool.query(
            'SELECT * FROM Paciente WHERE nombrePaciente LIKE ? ORDER BY nombrePaciente ASC',
            [`%${nombre}%`]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Ver citas de un paciente concreto
router.get('/consultas/citas-paciente', verificarNivel(0, 1, 2, 3), async (req, res) => {
    const { idPaciente } = req.query;
    if (!idPaciente) {
        return res.status(400).json({ mensaje: 'Falta el parámetro idPaciente.' });
    }
    try {
        const [filas] = await pool.query(
            `SELECT C.*, M.nombreMedico
             FROM Cita C
             JOIN Medico M ON C.idMedico = M.idMedico
             WHERE C.idPaciente = ?
             ORDER BY C.fechaIngreso DESC`,
            [idPaciente]
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Buscar citas por nombre de paciente, médico o estado (niveles 0, 1, 2 y 3)
router.get('/consultas/buscar-citas', verificarNivel(0, 1, 2, 3), async (req, res) => {
    const { paciente, medico, estado } = req.query;
    try {
        let sql    = `SELECT C.*, P.nombrePaciente, M.nombreMedico
                      FROM Cita C
                      JOIN Paciente P ON C.idPaciente = P.idPaciente
                      JOIN Medico M ON C.idMedico = M.idMedico
                      WHERE 1=1`;
        const params = [];

        if (paciente) { sql += ' AND P.nombrePaciente LIKE ?'; params.push(`%${paciente}%`); }
        if (medico)   { sql += ' AND M.nombreMedico LIKE ?';   params.push(`%${medico}%`); }
        if (estado)   { sql += ' AND C.estado = ?';            params.push(estado); }

        sql += ' ORDER BY C.fechaIngreso DESC';

        const [filas] = await pool.query(sql, params);
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;