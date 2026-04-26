'use strict';

const express    = require('express');
const path       = require('path');
const http       = require('http');
const dotenv     = require('dotenv');

const { iniciarWebSocket } = require('./assets/scriptsBackend/WebSocket');
const { iniciarJobs }      = require('./assets/scriptsBackend/Jobs');
const { verificarToken, verificarNivel } = require('./assets/scriptsBackend/autentificacionRoles/Middleware');

const autentificacionRutas = require('./assets/scriptsBackend/rutas/AutentificacionRutas');
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

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rutas públicas (no requieren token)
app.use('/api', autentificacionRutas);

// Rutas protegidas (requieren token)
app.use('/api', verificarToken, medicosRutas);
app.use('/api', verificarToken, pacientesRutas);
app.use('/api', verificarToken, especialidadesRutas);
app.use('/api', verificarToken, citasRutas);
app.use('/api', verificarToken, tratamientosRutas);
app.use('/api', verificarToken, pruebasRutas);

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
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});