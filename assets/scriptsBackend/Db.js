'use strict';

const mysql  = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.getConnection()
    .then(conn => {
        console.log('Conexión a MySQL establecida correctamente.');
        conn.release();
    })
    .catch(err => {
        console.error('Error al conectar con MySQL:', err.message);
    });

module.exports = pool;