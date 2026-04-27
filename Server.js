'use strict';

const express    = require('express');
const path       = require('path');
const http       = require('http');
const dotenv     = require('dotenv');
const cors       = require('cors');

const { iniciarWebSocket }               = require('./assets/scriptsBackend/WebSocket');
const { iniciarJobs }                    = require('./assets/scriptsBackend/Jobs');
const { verificarToken, verificarNivel } = require('./assets/scriptsBackend/autentificacionRoles/Middleware');

const autentificacionRutas = require('./assets/scriptsBackend/rutas/AutentificacionRutas');
const consultasRutas       = require('./assets/scriptsBackend/rutas/Consultas');
const medicosRutas         = require('./assets/scriptsBackend/rutas/Medicos');
const pacientesRutas       = require('./assets/scriptsBackend/rutas/Pacientes');
const especialidadesRutas  = require('./assets/scriptsBackend/rutas/Especialidades');
const citasRutas           = require('./assets/scriptsBackend/rutas/Citas');
const tratamientosRutas    = require('./assets/scriptsBackend/rutas/Tratamientos');
const pruebasRutas         = require('./assets/scriptsBackend/rutas/Pruebas');

dotenv.config();

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rutas públicas (no requieren token)
app.use('/api', autentificacionRutas);

// Rutas protegidas (requieren token)
app.use('/api', verificarToken, consultasRutas);
app.use('/api', verificarToken, medicosRutas);
app.use('/api', verificarToken, pacientesRutas);
app.use('/api', verificarToken, especialidadesRutas);
app.use('/api', verificarToken, citasRutas);
app.use('/api', verificarToken, tratamientosRutas);
app.use('/api', verificarToken, pruebasRutas);

// Ruta estructural (solo nivel 0)
app.post('/api/estructura', verificarToken, verificarNivel(0), async (req, res) => {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ mensaje: 'No se proporcionó ninguna sentencia SQL.' });
    try {
        const pool = require('./assets/scriptsBackend/Db');
        await pool.query(sql);
        return res.status(200).json({ mensaje: 'Operación ejecutada correctamente.' });
    } catch (error) {
        console.error('Error en operación estructural:', error);
        return res.status(500).json({ mensaje: error.message });
    }
});

// Rutas de páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'Admin.html'));
});

app.get('/consultasnivel1', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'ConsultasNivel1.html'));
});

app.get('/consultasnivel2', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'ConsultasNivel2.html'));
});

app.get('/consultasnivel3', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'ConsultasNivel3.html'));
});

iniciarWebSocket(server);
iniciarJobs();

server.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    console.log('Pulsa Ctrl+C para detenerlo.');
});