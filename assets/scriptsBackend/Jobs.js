'use strict';

const cron = require('node-cron');
const pool = require('./Db');

function iniciarJobs() {

    // Cada minuto: marcar como Cancelada las citas Pendientes cuya fecha ya pasó
    cron.schedule('* * * * *', async () => {
        try {
            const [resultado] = await pool.query(
                `UPDATE Cita
                 SET estado = 'Cancelada'
                 WHERE estado = 'Pendiente'
                 AND fechaIngreso < NOW()`
            );

            if (resultado.affectedRows > 0) {
                console.log(`Jobs: ${resultado.affectedRows} cita(s) cancelada(s) automáticamente.`);
            }

        } catch (error) {
            console.error('Error en job de cancelación de citas:', error);
        }
    });

    console.log('Jobs programados iniciados.');
}

module.exports = { iniciarJobs };