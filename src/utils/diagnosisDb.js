const db = require('../database/config.js');

async function diagnosticarDB() {
    console.log('Iniciando diagnóstico de base de datos...');

    // Verificar usuarios
    db.all('SELECT * FROM usuarios', [], (err, rows) => {
        if (err) {
            console.error('Error al consultar usuarios:', err);
        } else {
            console.log('Usuarios en la base de datos:', rows);
        }
    });

    // Verificar solicitudes
    db.all('SELECT * FROM solicitudes', [], (err, rows) => {
        if (err) {
            console.error('Error al consultar solicitudes:', err);
        } else {
            console.log('Solicitudes en la base de datos:', rows);
        }
    });

    // Verificar convenios
    db.all('SELECT * FROM convenios', [], (err, rows) => {
        if (err) {
            console.error('Error al consultar convenios:', err);
        } else {
            console.log('Convenios en la base de datos:', rows);
        }
    });
}

// Ejecutar diagnóstico
diagnosticarDB().catch(console.error);

module.exports = { diagnosticarDB };
